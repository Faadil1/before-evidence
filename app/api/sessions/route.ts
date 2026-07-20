import { NextResponse } from "next/server"; import { createSession } from "../../../lib/store"; import { publicCase } from "../../../lib/domain";
export async function POST(){const s=await createSession();return NextResponse.json({sessionId:s.sessionId,case:publicCase});}
