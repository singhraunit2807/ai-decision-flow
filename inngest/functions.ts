import { inngest } from "./client";
import { askDecision } from "@/lib/ai";
import { appendLog, updateRun } from "@/lib/store";
import type { WorkflowGraph } from "@/lib/types";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-ai-decision-workflow", retries: 2 },
  { event: "workflow/execute" },
  async ({ event, step }) => {
    const { runId, graph, customerRequest } = event.data as {
      runId: string;
      graph: WorkflowGraph;
      customerRequest: string;
    };

    updateRun(runId, { status: "running", logs: [] });
    let current = graph.nodes[0]?.id;
    const visited = new Set<string>();

    while (current && !visited.has(current)) {
      visited.add(current);
      updateRun(runId, { currentNode: current });
      const node = graph.nodes.find((n) => n.id === current);
      if (!node) break;

      if (node.label.trim().toUpperCase() === "END") {
        appendLog(runId, "END: Workflow completed.");
        break;
      }

      const answer = await step.run(`decision-${node.id}`, () => askDecision(node.prompt, customerRequest));
      appendLog(runId, `${node.label}: ${answer}`);

      const edge = graph.edges.find((e) => e.source === current && e.branch === answer);
      if (!edge) {
        appendLog(runId, "No matching branch. Workflow completed.");
        break;
      }
      current = edge.target;
    }

    updateRun(runId, { status: "completed", currentNode: undefined });
    return { runId };
  },
);
