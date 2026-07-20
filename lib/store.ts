import { promises as fs } from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import type { Session } from "./domain";
const file=path.join(process.cwd(),"data","sessions.json");
async function read():Promise<Record<string,Session>>{try{return JSON.parse(await fs.readFile(file,"utf8"));}catch{return {};}}
async function write(value:Record<string,Session>){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(value,null,2),"utf8");}
export async function createSession(){const all=await read();const sessionId=crypto.randomUUID();all[sessionId]={sessionId,scenarioId:"onboarding-effect",scenarioVersion:"2026.07.20-A",status:"open"};await write(all);return all[sessionId];}
export async function getSession(id:string){return (await read())[id];}
export async function updateSession(id:string, updater:(s:Session)=>Session){const all=await read();if(!all[id])return undefined;all[id]=updater(all[id]);await write(all);return all[id];}
