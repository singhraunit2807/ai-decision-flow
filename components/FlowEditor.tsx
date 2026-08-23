"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import DecisionNode from "./DecisionNode";
import type { WorkflowGraph } from "@/lib/types";

const initialNodes: Node[] = [
  { id: "start", type: "decision", position: { x: 420, y: 40 }, data: { label: "Support Check", prompt: "Is this a customer support request?" } },
  { id: "support", type: "decision", position: { x: 180, y: 180 }, data: { label: "Support Node", prompt: "Does the customer need urgent technical support?" } },
  { id: "sales", type: "decision", position: { x: 680, y: 180 }, data: { label: "Sales Node", prompt: "Is the customer interested in buying a product?" } },
  { id: "resolution", type: "decision", position: { x: 180, y: 320 }, data: { label: "Resolution Check", prompt: "Can the technical issue be resolved remotely?" } },
  { id: "remote", type: "decision", position: { x: 180, y: 460 }, data: { label: "Remote Resolution", prompt: "Can the issue be resolved with remote assistance?" } },
  { id: "resolved", type: "decision", position: { x: 180, y: 600 }, data: { label: "Resolution Complete", prompt: "Has the customer issue been successfully resolved?" } },
  { id: "escalation", type: "decision", position: { x: 180, y: 740 }, data: { label: "Escalation Required", prompt: "Does this customer require escalation to a technical expert?" } },
  { id: "expert", type: "decision", position: { x: 180, y: 880 }, data: { label: "Technical Expert Assigned", prompt: "Can a technical expert be assigned to this customer?" } },
  { id: "expertComplete", type: "decision", position: { x: -80, y: 1020 }, data: { label: "Expert Assignment Complete", prompt: "Has the technical expert been successfully assigned to the customer?" } },
  { id: "expertFailed", type: "decision", position: { x: 180, y: 1160 }, data: { label: "Expert Escalation Failed", prompt: "Could the escalation be handled by another support team?" } },
  { id: "alternative", type: "decision", position: { x: 180, y: 1300 }, data: { label: "Alternative Team Assigned", prompt: "Can an alternative support team be assigned to this customer?" } },
  { id: "alternativeComplete", type: "decision", position: { x: 180, y: 1440 }, data: { label: "Alternative Support Complete", prompt: "Has the alternative support team successfully resolved the customer issue?" } },
  { id: "manual", type: "decision", position: { x: 680, y: 600 }, data: { label: "Manual Support", prompt: "Should the customer receive manual technical support?" } },
  { id: "ticket", type: "decision", position: { x: 680, y: 740 }, data: { label: "Support Ticket Created", prompt: "Has a support ticket been created for the customer?" } },
  { id: "salesAssist", type: "decision", position: { x: 680, y: 320 }, data: { label: "Sales Assistance", prompt: "Does the customer need help with purchasing a product?" } },
  { id: "purchase", type: "decision", position: { x: 680, y: 460 }, data: { label: "Purchase Completed", prompt: "Has the customer's purchase request been successfully completed?" } },
  { id: "end", type: "decision", position: { x: 980, y: 600 }, data: { label: "END", prompt: "Has the customer request been successfully completed?" } },
];

const initialEdges: Edge[] = [
  { id: "start-yes", source: "start", target: "support", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "start-no", source: "start", target: "sales", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "support-yes", source: "support", target: "resolution", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "support-no", source: "support", target: "end", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "resolution-yes", source: "resolution", target: "remote", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "resolution-no", source: "resolution", target: "manual", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "remote-yes", source: "remote", target: "resolved", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "remote-no", source: "remote", target: "escalation", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "resolved-yes", source: "resolved", target: "end", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "resolved-no", source: "resolved", target: "escalation", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "escalation-yes", source: "escalation", target: "expert", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "escalation-no", source: "escalation", target: "manual", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "expert-yes", source: "expert", target: "expertComplete", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "expert-no", source: "expert", target: "manual", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "expertComplete-yes", source: "expertComplete", target: "end", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "expertComplete-no", source: "expertComplete", target: "expertFailed", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "expertFailed-yes", source: "expertFailed", target: "alternative", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "expertFailed-no", source: "expertFailed", target: "manual", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "alternative-yes", source: "alternative", target: "alternativeComplete", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "alternative-no", source: "alternative", target: "manual", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "alternativeComplete-yes", source: "alternativeComplete", target: "end", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "alternativeComplete-no", source: "alternativeComplete", target: "ticket", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "manual-yes", source: "manual", target: "ticket", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "manual-no", source: "manual", target: "end", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "ticket-yes", source: "ticket", target: "end", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "ticket-no", source: "ticket", target: "end", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "sales-yes", source: "sales", target: "salesAssist", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "sales-no", source: "sales", target: "end", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "salesAssist-yes", source: "salesAssist", target: "purchase", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "salesAssist-no", source: "salesAssist", target: "end", sourceHandle: "no", label: "NO", type: "smoothstep" },
  { id: "purchase-yes", source: "purchase", target: "end", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "purchase-no", source: "purchase", target: "end", sourceHandle: "no", label: "NO", type: "smoothstep" },
];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState("start");
  const [status, setStatus] = useState<any>(null);
  const [runId, setRunId] = useState("");
  const [customerRequest, setCustomerRequest] = useState("");

  const nodeTypes = useMemo(() => ({ decision: DecisionNode }), []);

  const onConnect = useCallback(
    (c: Connection) => {
      if (!c.source || !c.target || !c.sourceHandle) return;
      const branch = c.sourceHandle === "no" ? "NO" : "YES";
      setEdges((es) =>
        addEdge(
          {
            ...c,
            id: `${c.source}-${branch}-${c.target}`,
            label: branch,
            type: "smoothstep",
            animated: false,
          },
          es,
        ),
      );
    },
    [setEdges],
  );

  const updatePrompt = (value: string) =>
    setNodes((ns) =>
      ns.map((n) =>
        n.id === selected ? { ...n, data: { ...n.data, prompt: value } } : n,
      ),
    );

  const addNode = () => {
    const id = `node-${Date.now()}`;
    setNodes((ns) => [
      ...ns,
      {
        id,
        type: "decision",
        position: { x: 150 + ns.length * 20, y: 520 + ns.length * 15 },
        data: {
          label: `Decision ${ns.length + 1}`,
          prompt: "Should this decision continue?",
        },
      },
    ]);
    setSelected(id);
  };

  const graph: WorkflowGraph = {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: String(n.data.label),
      prompt: String(n.data.prompt),
      position: n.position,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      branch: e.sourceHandle === "no" ? "NO" : "YES",
    })),
  };

  const execute = async () => {
    if (!customerRequest.trim()) {
      setStatus({ status: "failed", logs: ["Customer request is required."] });
      return;
    }

    setStatus({ status: "queued", logs: [] });
    setRunId("");

    const r = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ graph, customerRequest }),
    });

    const d = await r.json();
    if (!r.ok) {
      setStatus({ status: "failed", logs: [d.error] });
      return;
    }
    setRunId(d.runId);
  };

  useEffect(() => {
    if (!runId) return;

    const t = setInterval(async () => {
      const r = await fetch(`/api/status?id=${runId}`);
      if (!r.ok) return;
      const d = await r.json();
      setStatus(d);
      if (d.status === "completed" || d.status === "failed") clearInterval(t);
    }, 700);

    return () => clearInterval(t);
  }, [runId]);

  const selectedNode = nodes.find((n) => n.id === selected);

  return (
    <div style={{ height: "calc(100vh - 68px)", display: "contents" }}>
      <aside className="sidebar">
        <h3 className="panel-title">Nodes</h3>
        <div className="node-card" onClick={addNode}>
          <strong>+ Decision Node</strong>
          <span>Add an AI YES/NO decision step</span>
        </div>
        <div className="help">
          <b>How to use</b>
          <br />
          Enter a customer request and run the workflow.
          <br />
          Select a node to edit its prompt.
          <br />
          Left output is YES and right output is NO.
        </div>
      </aside>

      <section className="canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => setSelected(n.id)}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </section>

      <aside className="rightbar">
        <div className="section">
          <h3 className="panel-title">Customer Request</h3>
          <div className="field">
            <textarea
              value={customerRequest}
              onChange={(e) => setCustomerRequest(e.target.value)}
              placeholder="Example: My laptop is broken and I need urgent technical support."
              aria-label="Customer request"
            />
          </div>
        </div>

        <div className="section">
          <h3 className="panel-title">Decision Node</h3>
          {selectedNode ? (
            <>
              <div className="field">
                <label>Node name</label>
                <input
                  value={String(selectedNode.data.label)}
                  onChange={(e) =>
                    setNodes((ns) =>
                      ns.map((n) =>
                        n.id === selected
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n,
                      ),
                    )
                  }
                />
              </div>
              <div className="field">
                <label>Prompt</label>
                <textarea
                  value={String(selectedNode.data.prompt)}
                  onChange={(e) => updatePrompt(e.target.value)}
                />
              </div>
            </>
          ) : (
            <p>Select a node.</p>
          )}
        </div>

        <div className="section">
          <button className="btn primary" style={{ width: "100%" }} onClick={execute}>
            Run AI Workflow
          </button>
          <button
            className="btn"
            style={{ width: "100%", marginTop: 8 }}
            onClick={() => {
              localStorage.setItem("decision-flow", JSON.stringify(graph));
              alert("Workflow saved locally.");
            }}
          >
            Save Workflow
          </button>
        </div>

        <div>
          <h3 className="panel-title">Execution</h3>
          <div className="status">
            <span className={`dot ${status?.status || ""}`}></span>
            {status?.status || "idle"}
          </div>
          {status?.logs?.map((l: string, i: number) => (
            <div className="log" key={i}>
              {l}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
