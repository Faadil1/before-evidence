import { describe,it,expect } from "vitest";
import { createSession, getSession, lockSession } from "../lib/store";

const commitment={claim:"The revised onboarding sequence causes more new accounts to activate.",confidence:55,rival1:"Acquisition mix changed.",rival2:"Novelty effect.",prediction:"Activation increases.",refutation:"Below 10% means refuted.",design:"Randomized holdout for 14 days."};

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