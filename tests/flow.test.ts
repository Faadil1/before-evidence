import { readFileSync } from "node:fs";
import { describe,it,expect } from "vitest";
import { auditCanSubmit, auditHierarchy, canEnterReview, cancelSeal, commitmentPlaceholders, confidenceDelta, confirmSeal, emptyCommitment, formatSealedAt, isPostLockReadOnly, recoverableAuditMessage, sealedHeaderUsesDocumentFlow, validateCommitmentDraft, validateInterpretationDraft } from "../lib/flow";
import { canonicalCommitmentRecord, canonicalJson, canonicalSealedString, compareVerification, buildExport, markdownExport, formatDimensionLabel, formatEnumLabel, formatRelationshipLabel, normalizedVerdictLabel, parseExport, preSealChecks, recordSchemaVersion } from "../lib/record";
import { normalizedVerdictSchema } from "../lib/domain";
import { quality, validateOperationalCommitment, validateOperationalInterpretation } from "../lib/quality";

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


describe("record integrity helpers",()=>{
 const sealedAt="2026-07-21T05:00:00.000Z";
 const record=canonicalCommitmentRecord({caseId:"case-001",scenarioId:"onboarding-effect",commitment:complete,sealedAt});
 it("validates normalized verdict enum values",()=>{expect(normalizedVerdictSchema.safeParse("aligned").success).toBe(true);expect(normalizedVerdictSchema.safeParse("inconsistent").success).toBe(true);expect(normalizedVerdictSchema.safeParse("pass").success).toBe(false);expect(normalizedVerdictLabel("insufficient_evidence")).toBe("INSUFFICIENT EVIDENCE");});
 it("canonicalizes with stable key order and documented trimming",()=>{expect(record.schemaVersion).toBe(recordSchemaVersion);expect(record.claim).toBe(complete.claim);expect(canonicalJson({b:1,a:2})).toBe(canonicalJson({a:2,b:1}));expect(canonicalCommitmentRecord({caseId:"case-001",scenarioId:"onboarding-effect",commitment:{...complete,claim:`  ${complete.claim}  `},sealedAt}).claim).toBe(complete.claim);});
 it("changes canonical output when covered fields change",()=>{const baseline=canonicalSealedString(record);expect(canonicalSealedString(canonicalCommitmentRecord({caseId:"case-001",scenarioId:"onboarding-effect",commitment:{...complete,claim:complete.claim+" changed"},sealedAt}))).not.toBe(baseline);expect(canonicalSealedString(canonicalCommitmentRecord({caseId:"case-001",scenarioId:"onboarding-effect",commitment:{...complete,prediction:complete.prediction+" soon"},sealedAt}))).not.toBe(baseline);expect(canonicalSealedString(canonicalCommitmentRecord({caseId:"case-001",scenarioId:"onboarding-effect",commitment:{...complete,confidence:56},sealedAt}))).not.toBe(baseline);expect(canonicalSealedString(canonicalCommitmentRecord({caseId:"case-001",scenarioId:"onboarding-effect",commitment:complete,sealedAt:"2026-07-21T05:01:00.000Z"}))).not.toBe(baseline);});
 it("keeps array order significant",()=>{const swapped={...record,rivalExplanations:[record.rivalExplanations[1],record.rivalExplanations[0]] as [string,string]};expect(canonicalSealedString(swapped)).not.toBe(canonicalSealedString(record));});
 it("builds export and markdown without secrets or premature evidence",()=>{const session:any={sessionId:"s1",scenarioId:"onboarding-effect",scenarioVersion:"2026.07.20-A",status:"locked",commitment:complete,lockedAt:sealedAt,recordSchemaVersion,recordFingerprint:"sha256:abc"};const pre=buildExport(session,{result:"hidden"})!;expect(pre.evidence).toBeUndefined();expect(JSON.stringify(pre)).not.toContain("OPENROUTER_API_KEY");expect(markdownExport(pre)).toContain("BEFORE EVIDENCE");session.evidenceRevealedAt=sealedAt;session.evidenceVersion="2026.07.20-A";const post=buildExport(session,{result:"shown"})!;expect(post.evidence).toBeTruthy();expect(parseExport(JSON.stringify(post))?.recordFingerprint).toBe("sha256:abc");});
 it("verification compares recalculated fingerprints and rejects invalid exports",()=>{expect(compareVerification("sha256:abc","sha256:abc")).toBe("match");expect(compareVerification("sha256:abc","sha256:def")).toBe("mismatch");expect(parseExport("not json")).toBeUndefined();expect(parseExport(JSON.stringify({exportVersion:"wrong"}))).toBeUndefined();});
 it("pre-seal checklist is deterministic and advisory",()=>{const checks=preSealChecks(complete);expect(checks.some(c=>c.id==="threshold"&&c.status==="ready")).toBe(true);expect(checks.some(c=>c.id==="duration"&&c.status==="ready")).toBe(true);expect(preSealChecks({...complete,rival2:complete.rival1}).some(c=>c.id==="rivals"&&c.status==="review")).toBe(true);expect(complete.claim).toBe("The revised onboarding sequence causes more new accounts to activate.");});
});

describe("deterministic text quality",()=>{
 it("rejects keyboard mash and punctuation padding",()=>{expect(quality("gvdchjksl;aplokjiuhygqtuijok;l",4).valid).toBe(false);expect(validateOperationalCommitment({...complete,refutation:"!!!!!!!!!!!!!! 18% 14 days !!!!!"}).refutation).toBeTruthy();});
 it("accepts meaningful French and technical percentage language",()=>{const french={claim:"La nouvelle séquence d accueil augmente l activation des nouveaux comptes.",confidence:55,rival1:"Le mélange des canaux acquisition a changé pendant le test.",rival2:"Un effet de nouveauté temporaire modifie le comportement.",prediction:"L activation augmente pour les nouveaux comptes.",refutation:"Une hausse inférieure à 10% compterait contre la thèse.",design:"Comparer un groupe témoin et une variante pendant 14 jours en mesurant l activation."};expect(validateOperationalCommitment(french)).toEqual({});expect(validateOperationalCommitment({...complete,prediction:"API conversion lift exceeds 10% for B2B cohorts."}).prediction).toBeUndefined();});
 it("rejects repeated tokens and next-experiment gibberish",()=>{expect(quality("test test test test test test",4).valid).toBe(false);expect(validateOperationalInterpretation("The evidence supports the claim and implies a segment-specific effect.","asdfasdfasdf 18% 14 days ;;;;;").next).toBeTruthy();});
});

describe("claim validator regression",()=>{
 it("accepts complete operational claims without rigid templates",()=>{
  expect(validateOperationalCommitment({...complete,claim:"The revised onboarding sequence increases day-7 activation among eligible new accounts."}).claim).toBeUndefined();
  expect(validateOperationalCommitment({...complete,claim:"La nouvelle séquence d’intégration augmente l’activation au septième jour chez les nouveaux comptes admissibles."}).claim).toBeUndefined();
  expect(validateOperationalCommitment({...complete,claim:"Higher cache latency reduces successful checkout completion."}).claim).toBeUndefined();
 });
 it("rejects non-operational and meaningless claims",()=>{
  expect(validateOperationalCommitment({...complete,claim:"asdjkl;lkjhjkh 18% during 14 days"}).claim).toBeTruthy();
  expect(validateOperationalCommitment({...complete,claim:"onboarding onboarding onboarding increase increase"}).claim).toBeTruthy();
  expect(validateOperationalCommitment({...complete,claim:"The revised onboarding sequence."}).claim).toBeTruthy();
 });
});
describe("audit presentation helpers",()=>{
 const enumValues=["aligned","partially_aligned","inconsistent","insufficient_evidence","supports","does_not_refute","inconclusive","contradicts","prediction","refutation_condition","interpretation","confidence","rival_explanations","evidence_standard","next_experiment","consistent","partially_consistent","not_assessable","possibly_excessive","possibly_insufficient","high","medium","low"];
 it("humanizes every current enum value and future unknown values",()=>{for(const value of enumValues){const label=formatEnumLabel(value);expect(label).not.toContain("_");expect(label).toBe(label.toUpperCase());expect(label.length).toBeGreaterThan(2);}expect(formatDimensionLabel("rival_explanations")).toBe("RIVAL EXPLANATIONS");expect(formatRelationshipLabel("does_not_refute")).toBe("DOES NOT REFUTE");expect(formatEnumLabel("future_schema_value")).toBe("FUTURE SCHEMA VALUE");expect(formatEnumLabel(undefined)).toBe("UNAVAILABLE");});
 it("keeps normalized verdict labels human-readable",()=>{expect(normalizedVerdictLabel("partially_aligned" as any)).toBe("PARTIALLY ALIGNED");expect(normalizedVerdictLabel(undefined)).toBe("LEGACY AUDIT");});
});

describe("audit presentation structure",()=>{
 const page=readFileSync("app/page.tsx","utf8");
 const css=readFileSync("app/globals.css","utf8");
 it("renders normalized verdict before comparison without a competing Verdict prefix",()=>{expect(page.indexOf("audit-hero")).toBeLessThan(page.indexOf("audit-grid"));expect(page).toContain(".replace(/^\\s*Verdict:");expect(page).not.toContain("<h2 tabIndex={-1}>Verdict:");});
 it("renders relationship status separately from explanation prose",()=>{expect(page).toContain("<label>RELATIONSHIP</label><strong>{formatRelationshipLabel(d.relationship)}</strong>");expect(page).not.toContain("{d.relationship}: {d.explanation}");});
 it("structures surviving rivals and legacy string-only rivals",()=>{expect(page).toContain("SURVIVING RIVAL");expect(page).toContain("typeof r===\"string\"");expect(page).toContain("whyItSurvives");expect(page).toContain("whatWouldTestIt");});
 it("structures next experiment arrays without empty lists",()=>{expect(page).toContain("DISCRIMINATING POWER");expect(page).toContain("WOULD HELP RESOLVE");expect(page).toContain("WOULD STILL LEAVE OPEN");expect(page).toContain("if(!items?.length)return null");});
 it("polishes fingerprint and local history without storing full records",()=>{expect(page).toContain("Open record");expect(page).toContain("Remove from device");expect(page).toContain("beforeEvidenceHistory");expect(page).not.toContain("localStorage.setItem(\"beforeEvidenceHistory\",JSON.stringify(exportRecord");expect(css).toContain(".verify textarea{display:block;width:100%;max-width:none");expect(css).toContain("overflow-wrap:anywhere");});
 it("defines responsive stacking and touch/focus affordances",()=>{expect(css).toContain("grid-template-columns:repeat(3,minmax(0,1fr))");expect(css).toContain("grid-template-columns:1fr");expect(css).toContain("min-height:44px");expect(css).toContain(":focus-visible");expect(css).toContain("prefers-reduced-motion:reduce");});
});
