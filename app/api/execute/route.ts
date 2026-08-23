import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { createRun, validateGraph } from "@/lib/store";
import type { WorkflowGraph } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { graph: WorkflowGraph; customerRequest: string };
    if (!body.customerRequest?.trim()) throw new Error("Customer request is required.");
    validateGraph(body.graph);
    const run = createRun();
    await inngest.send({ name: "workflow/execute", data: { runId: run.id, graph: body.graph, customerRequest: body.customerRequest.trim() } });
    return NextResponse.json({ runId: run.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Execution failed" }, { status: 400 });
  }
}
