import { NextResponse } from "next/server";
import { getRun } from "@/lib/store";
export async function GET(req:Request){const id=new URL(req.url).searchParams.get("id");if(!id)return NextResponse.json({error:"Missing id"},{status:400});const run=getRun(id);if(!run)return NextResponse.json({error:"Run not found"},{status:404});return NextResponse.json(run);}
