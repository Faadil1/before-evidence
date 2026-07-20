import { describe,it,expect } from "vitest";
import { POST as create } from "../app/api/sessions/route";
import { POST as lock } from "../app/api/sessions/[id]/lock/route";
import { GET as evidence } from "../app/api/sessions/[id]/evidence/route";
import { POST as audit } from "../app/api/sessions/[id]/audit/route";
import { auditSchema } from "../lib/domain";
const commitment={claim:"The revised onboarding sequence causes more new accounts to activate.",confidence:55,rival1:"Acquisition mix changed.",rival2:"Novelty effect.",prediction:"Activation increases.",refutation:"Below 10% means refuted.",design:"Randomized holdout for 14 days."};
const params=(id:string)=>({params:Promise.resolve({id})});
async function session(){const r=await create();return (await r.json()).sessionId as string;}
describe("session integrity",()=>{
 it("locks once and rejects a second lock",async()=>{const id=await session();expect((await lock(new Request("http://x",{method:"POST",body:JSON.stringify(commitment)}),params(id))).status).toBe(200);expect((await lock(new Request("http://x",{method:"POST",body:JSON.stringify(commitment)}),params(id))).status).toBe(409);});
 it("rejects evidence before lock and returns identical evidence after lock",async()=>{const a=await session();expect((await evidence(new Request("http://x"),params(a))).status).toBe(403);await lock(new Request("http://x",{method:"POST",body:JSON.stringify(commitment)}),params(a));const one=await (await evidence(new Request("http://x"),params(a))).json();const b=await session();await lock(new Request("http://x",{method:"POST",body:JSON.stringify(commitment)}),params(b));const two=await (await evidence(new Request("http://x"),params(b))).json();expect(one).toEqual(two);});
 it("keeps independent sessions independent",async()=>{const a=await session();const b=await session();await lock(new Request("http://x",{method:"POST",body:JSON.stringify(commitment)}),params(a));expect((await evidence(new Request("http://x"),params(b))).status).toBe(403);});
 it("does not accept browser audit packets and errors honestly without a key",async()=>{const id=await session();await lock(new Request("http://x",{method:"POST",body:JSON.stringify(commitment)}),params(id));const r=await audit(new Request("http://x",{method:"POST",body:JSON.stringify({commitment:{claim:"attacker"},evidence:{result:"fake"}})}),params(id));expect(r.status).toBe(503);});
 it("validates structured audit output",()=>{expect(auditSchema.safeParse({verdict:"partial",refutationStandard:{triggered:false,detail:"ok"},confidenceCalibration:{expectedDirection:"up",proportionate:true,detail:"ok"},interpretationQuality:{unsupportedClaims:[],detail:"ok"},survivingRivals:["mix"],strongestNextExperiment:"stratify"}).success).toBe(true);});
});