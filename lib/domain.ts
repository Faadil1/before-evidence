import { z } from "zod";

export const scenarioId = "onboarding-effect";
export const scenarioVersion = "2026.07.20-A";
export const commitmentSchema = z.object({claim:z.string().min(10),confidence:z.number().min(0).max(100),rival1:z.string().min(5),rival2:z.string().min(5),prediction:z.string().min(5),refutation:z.string().min(10),design:z.string().min(10)});
export const interpretationSchema = z.object({interpretation:z.string().min(10),updatedConfidence:z.number().min(0).max(100),proposedNextExperiment:z.string().min(10)});
export const auditSchema = z.object({verdict:z.string(),refutationStandard:z.object({triggered:z.boolean(),detail:z.string()}),confidenceCalibration:z.object({expectedDirection:z.string(),proportionate:z.boolean(),detail:z.string()}),interpretationQuality:z.object({unsupportedClaims:z.array(z.string()),detail:z.string()}),survivingRivals:z.array(z.string()),strongestNextExperiment:z.string()});
export type Commitment=z.infer<typeof commitmentSchema>; export type Interpretation=z.infer<typeof interpretationSchema>; export type Audit=z.infer<typeof auditSchema>;
export type Session={sessionId:string;scenarioId:string;scenarioVersion:string;status:"open"|"locked"|"revealed"|"interpreted"|"audited";commitment?:Commitment;lockedAt?:string;evidenceVersion?:string;evidenceRevealedAt?:string;interpretation?:string;updatedConfidence?:number;proposedNextExperiment?:string;audit?:Audit};
export const publicCase={scenarioId,scenarioVersion,title:"Does revised onboarding cause more activation?",description:"Randomized holdout over 14 days; compare activation within 7 days, segmented by new vs returning accounts."};
export const fixedEvidence=Object.freeze({version:scenarioVersion,result:"The intervention increased activation by 18% over the 14-day baseline. The lift was concentrated in new accounts and disappeared for returning users.",method:"Randomized holdout: 50% of eligible new accounts saw the revised onboarding sequence; 50% saw the existing sequence. Primary measure: activated within 7 days."});
