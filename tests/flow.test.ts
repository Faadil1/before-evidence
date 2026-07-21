import { describe,it,expect } from "vitest";
import { auditCanSubmit, auditHierarchy, canEnterReview, cancelSeal, commitmentPlaceholders, confidenceDelta, confirmSeal, emptyCommitment, formatSealedAt, isPostLockReadOnly, recoverableAuditMessage, sealedHeaderUsesDocumentFlow, validateCommitmentDraft, validateInterpretationDraft } from "../lib/flow";

const complete={claim:"The revised onboarding sequence causes more new accounts to activate.",confidence:55,rival1:"Acquisition mix changed during the experiment.",rival2:"A temporary novelty effect changed user behavior.",prediction:"Activation increases for new accounts.",refutation:"Below 10% activation lift means the claim is refuted.",design:"Randomized holdout for 14 days using activation within 7 days as the metric."};

describe("commitment flow policy",()=>{
 it("starts commitment text fields empty",()=>{expect(emptyCommitment).toMatchObject({claim:"",rival1:"",rival2:"",prediction:"",refutation:"",design:""});});
 it("keeps placeholders separate from submitted values",()=>{expect(commitmentPlaceholders.claim).not.toBe(emptyCommitment.claim);expect(Object.values(commitmentPlaceholders).every(Boolean)).toBe(true);});
 it("blocks incomplete or whitespace drafts from Review",()=>{expect(canEnterReview(emptyCommitment)).toBe(false);expect(validateCommitmentDraft({...complete,claim:"   "}).claim).toBeTruthy();});
 it("allows complete user-authored drafts to reach Review",()=>{expect(validateCommitmentDraft(complete)).toEqual({});expect(canEnterReview(complete)).toBe(true);});
 it("models canceling and confirming final lock distinctly",()=>{expect(cancelSeal("open")).toEqual({status:"open",lockCalled:false});expect(confirmSeal("open")).toEqual({status:"open",lockCalled:true});expect(confirmSeal("locked")).toEqual({status:"locked",lockCalled:false});});
 it("treats post-lock commitment and review views as read-only",()=>{expect(isPostLockReadOnly("locked")).toBe(true);expect(isPostLockReadOnly("revealed")).toBe(true);expect(isPostLockReadOnly("open")).toBe(false);});
 it("rejects weak interpretations and short next experiments",()=>{expect(validateInterpretationDraft("What does mean?","Run a careful stratified follow-up.").interpretation).toBeTruthy();expect(validateInterpretationDraft("The evidence supports the claim for new accounts only.","Too short").next).toBeTruthy();});
 it("accepts substantive interpretations",()=>{expect(validateInterpretationDraft("The evidence supports the claim for new accounts only and implies the effect is segment-specific.","Run a stratified follow-up by account segment.")).toEqual({});});
 it("formats sealed timestamps without milliseconds",()=>{const text=formatSealedAt("2026-07-21T04:24:26.703Z");expect(text).toContain("Sealed");expect(text).toContain("2026");expect(text).not.toContain(".703");});
 it("uses document-flow sealed header structure and audit hierarchy",()=>{expect(sealedHeaderUsesDocumentFlow).toBe(true);expect(auditHierarchy[0]).toBe("verdict");});
 it("calculates confidence delta for increase, decrease, and no change",()=>{expect(confidenceDelta(55,72)).toBe("+17 points");expect(confidenceDelta(72,55)).toBe("-17 points");expect(confidenceDelta(55,55)).toBe("No confidence change");});
 it("models recoverable audit status and duplicate-submit protection",()=>{expect(auditCanSubmit("pending")).toBe(false);expect(auditCanSubmit("completed")).toBe(false);expect(auditCanSubmit("failed")).toBe(true);expect(recoverableAuditMessage("pending")).toContain("Retry");expect(recoverableAuditMessage("failed")).toContain("safe");});});
