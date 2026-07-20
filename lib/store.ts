import crypto from "node:crypto";
import { Pool } from "pg";
import type { Commitment, Session } from "./domain";
import { scenarioId, scenarioVersion } from "./domain";

type SessionRow={
  session_id:string; scenario_id:string; scenario_version:string; status:Session["status"];
  commitment:Commitment|null; locked_at:Date|string|null; evidence_version:string|null;
  evidence_revealed_at:Date|string|null; interpretation:string|null;
  updated_confidence:number|null; proposed_next_experiment:string|null; audit:Session["audit"]|null;
  created_at:Date|string; updated_at:Date|string;
};

declare global { var beforeEvidencePool:Pool|undefined; }

const memory=new Map<string,Session>();
const useMemory=process.env.NODE_ENV==="test"||process.env.VITEST==="true";

function iso(value:Date|string|null|undefined){return value?new Date(value).toISOString():undefined;}
function rowToSession(row:SessionRow):Session{return {sessionId:row.session_id,scenarioId:row.scenario_id,scenarioVersion:row.scenario_version,status:row.status,commitment:row.commitment??undefined,lockedAt:iso(row.locked_at),evidenceVersion:row.evidence_version??undefined,evidenceRevealedAt:iso(row.evidence_revealed_at),interpretation:row.interpretation??undefined,updatedConfidence:row.updated_confidence??undefined,proposedNextExperiment:row.proposed_next_experiment??undefined,audit:row.audit??undefined,createdAt:iso(row.created_at),updatedAt:iso(row.updated_at)};}
function requireDatabaseUrl(){if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL is required for persistent session storage.");return process.env.DATABASE_URL;}
function pool(){if(!globalThis.beforeEvidencePool){const connectionString=requireDatabaseUrl();const local=/localhost|127\.0\.0\.1/.test(connectionString);globalThis.beforeEvidencePool=new Pool({connectionString,ssl:local?undefined:{rejectUnauthorized:false}});}return globalThis.beforeEvidencePool;}
async function ensureSchema(){await pool().query(`create table if not exists sessions (
  session_id text primary key,
  scenario_id text not null,
  scenario_version text not null,
  status text not null,
  commitment jsonb,
  locked_at timestamptz,
  evidence_version text,
  evidence_revealed_at timestamptz,
  interpretation text,
  updated_confidence integer,
  proposed_next_experiment text,
  audit jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)`);}
function now(){return new Date().toISOString();}
function makeSession():Session{const t=now();return {sessionId:crypto.randomUUID(),scenarioId,scenarioVersion,status:"open",createdAt:t,updatedAt:t};}

export async function createSession(){const s=makeSession();if(useMemory){memory.set(s.sessionId,s);return s;}await ensureSchema();const result=await pool().query<SessionRow>("insert into sessions (session_id,scenario_id,scenario_version,status) values ($1,$2,$3,$4) returning *",[s.sessionId,s.scenarioId,s.scenarioVersion,s.status]);return rowToSession(result.rows[0]);}
export async function getSession(id:string){if(useMemory)return memory.get(id);await ensureSchema();const result=await pool().query<SessionRow>("select * from sessions where session_id=$1",[id]);return result.rows[0]?rowToSession(result.rows[0]):undefined;}
export async function updateSession(id:string, updater:(s:Session)=>Session){const current=await getSession(id);if(!current)return undefined;const next={...updater(current),updatedAt:now()};if(useMemory){memory.set(id,next);return next;}await ensureSchema();const result=await pool().query<SessionRow>(`update sessions set status=$2, commitment=$3, locked_at=$4, evidence_version=$5, evidence_revealed_at=$6, interpretation=$7, updated_confidence=$8, proposed_next_experiment=$9, audit=$10, updated_at=now() where session_id=$1 returning *`,[id,next.status,next.commitment??null,next.lockedAt??null,next.evidenceVersion??null,next.evidenceRevealedAt??null,next.interpretation??null,next.updatedConfidence??null,next.proposedNextExperiment??null,next.audit??null]);return rowToSession(result.rows[0]);}
export async function lockSession(id:string, commitment:Commitment){if(useMemory){const s=memory.get(id);if(!s)return {status:"missing" as const};if(s.status!=="open")return {status:"conflict" as const};const next={...s,commitment,status:"locked" as const,lockedAt:now(),evidenceVersion:s.scenarioVersion,updatedAt:now()};memory.set(id,next);return {status:"locked" as const,session:next};}await ensureSchema();const result=await pool().query<SessionRow>("update sessions set commitment=$2, status='locked', locked_at=now(), evidence_version=scenario_version, updated_at=now() where session_id=$1 and status='open' returning *",[id,commitment]);if(result.rows[0])return {status:"locked" as const,session:rowToSession(result.rows[0])};const existing=await getSession(id);return existing?{status:"conflict" as const}:{status:"missing" as const};}