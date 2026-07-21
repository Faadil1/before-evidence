import { z } from "zod";

export const scenarioId = "onboarding-effect";
export const scenarioVersion = "2026.07.20-A";
const text=(min:number)=>z.string().transform(v=>v.trim()).pipe(z.string().min(min));
const interpretationText=text(40).refine(v=>!/^\s*[^.!]*\?\s*$/.test(v),"Interpretation cannot be only a question.").refine(v=>/\b(implies|suggests|shows|means|supports|indicates|demonstrates)\b/i.test(v),"Interpretation must state what the evidence implies.");
export const commitmentSchema = z.object({claim:text(20),confidence:z.number().min(0).max(100),rival1:text(15),rival2:text(15),prediction:text(15),refutation:text(20),design:text(25)});
export const interpretationSchema = z.object({interpretation:interpretationText,updatedConfidence:z.number().min(0).max(100),proposedNextExperiment:text(25)});
export const normalizedVerdictSchema=z.enum(["aligned","partially_aligned","inconsistent","insufficient_evidence"]);
export const auditSchema = z.object({normalizedVerdict:normalizedVerdictSchema,verdict:z.string(),refutationStandard:z.object({triggered:z.boolean(),detail:z.string()}),confidenceCalibration:z.object({expectedDirection:z.string(),proportionate:z.boolean(),detail:z.string()}),interpretationQuality:z.object({unsupportedClaims:z.array(z.string()),detail:z.string()}),survivingRivals:z.array(z.string()),strongestNextExperiment:z.string()});
export const auditMetadataSchema = z.object({provider:z.literal("openrouter"),requestedModel:z.string().min(1),returnedModel:z.string().min(1).nullable(),generationId:z.string().min(1).nullable(),promptTokens:z.number().int().nonnegative().nullable(),completionTokens:z.number().int().nonnegative().nullable(),totalTokens:z.number().int().nonnegative().nullable(),durationMs:z.number().int().nonnegative(),completedAt:z.string().datetime()});
export type Commitment=z.infer<typeof commitmentSchema>; export type Interpretation=z.infer<typeof interpretationSchema>; export type Audit=z.infer<typeof auditSchema>; export type AuditMetadata=z.infer<typeof auditMetadataSchema>;
export type Session={sessionId:string;scenarioId:string;scenarioVersion:string;status:"open"|"locked"|"revealed"|"interpreted"|"audited";commitment?:Commitment;lockedAt?:string;evidenceVersion?:string;evidenceRevealedAt?:string;interpretation?:string;updatedConfidence?:number;proposedNextExperiment?:string;audit?:Audit;auditMetadata?:AuditMetadata;recordSchemaVersion?:string;recordFingerprint?:string;auditStatus?:"idle"|"pending"|"failed"|"completed";auditError?:string;createdAt?:string;updatedAt?:string};
export const publicCase={scenarioId,scenarioVersion,title:"Does revised onboarding cause more activation?",description:"Randomized holdout over 14 days; compare activation within 7 days, segmented by new vs returning accounts."};
export const fixedEvidence=Object.freeze({version:scenarioVersion,result:"The intervention increased activation by 18% over the 14-day baseline. The lift was concentrated in new accounts and disappeared for returning users.",method:"Randomized holdout: 50% of eligible new accounts saw the revised onboarding sequence; 50% saw the existing sequence. Primary measure: activated within 7 days."});


