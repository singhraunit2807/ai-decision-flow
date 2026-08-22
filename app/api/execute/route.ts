import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { createRun, validateGraph } from "@/lib/store";
import type { WorkflowGraph } from "@/lib/types";
export async function POST(req:Request){try{const graph=await req.json() as WorkflowGraph;validateGraph(graph);const run=createRun();await inngest.send({name:"workflow/execute",data:{runId:run.id,graph}});return NextResponse.json({runId:run.id});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Execution failed"},{status:400});}}
