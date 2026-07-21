import { describe,it,expect } from "vitest";
import { createSession, getSession, lockSession } from "../lib/store";

const commitment={claim:"The revised onboarding sequence causes more new accounts to activate.",confidence:55,rival1:"Acquisition mix changed during the experiment.",rival2:"A temporary novelty effect changed user behavior.",prediction:"Activation increases for new accounts.",refutation:"Below 10% activation lift means the claim is refuted.",design:"Randomized holdout for 14 days using activation within 7 days as the metric."};

describe("persistent store contract",()=>{
 it("creates independent session records and locks atomically once",async()=>{
  const a=await createSession();
  const b=await createSession();
  expect(a.sessionId).not.toBe(b.sessionId);
  expect((await lockSession(a.sessionId,commitment)).status).toBe("locked");
  expect((await lockSession(a.sessionId,commitment)).status).toBe("conflict");
  expect((await getSession(b.sessionId))?.status).toBe("open");
 });
});