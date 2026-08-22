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
  { id: "start", type: "decision", position: { x: 80, y: 100 }, data: { label: "Support Check", prompt: "Is this a customer support request? Answer YES or NO only." } },
  { id: "support", type: "decision", position: { x: -40, y: 330 }, data: { label: "Support Node", prompt: "Does the customer need urgent technical support? Answer YES or NO only." } },
  { id: "sales", type: "decision", position: { x: 300, y: 330 }, data: { label: "Sales Node", prompt: "Is the customer interested in buying a product? Answer YES or NO only." } },
];

const initialEdges: Edge[] = [
  { id: "start-yes", source: "start", target: "support", sourceHandle: "yes", label: "YES", type: "smoothstep" },
  { id: "start-no", source: "start", target: "sales", sourceHandle: "no", label: "NO", type: "smoothstep" },
];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState("start");
  const [status, setStatus] = useState<any>(null);
  const [runId, setRunId] = useState("");
  const [customerInput, setCustomerInput] = useState("");
  const nodeTypes = useMemo(() => ({ decision: DecisionNode }), []);

  const onConnect = useCallback((c: Connection) => {
    const branch = c.sourceHandle === "no" ? "NO" : "YES";
    setEdges((es) => addEdge({ ...c, id: `${c.source}-${branch}-${c.target}`, label: branch, type: "smoothstep" }, es));
  }, [setEdges]);

  const updatePrompt = (v: string) => setNodes((ns) => ns.map((n) => n.id === selected ? { ...n, data: { ...n.data, prompt: v } } : n));

  const addNode = () => {
    const id = `node-${Date.now()}`;
    setNodes((ns) => [...ns, { id, type: "decision", position: { x: 150 + ns.length * 20, y: 520 + ns.length * 15 }, data: { label: `Decision ${ns.length + 1}`, prompt: "Should this decision continue? Answer YES or NO only." } }]);
    setSelected(id);
  };

  const graph: WorkflowGraph = {
    nodes: nodes.map((n) => ({ id: n.id, label: String(n.data.label), prompt: String(n.data.prompt), position: n.position })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, branch: e.sourceHandle === "no" ? "NO" : "YES" })),
  };

  const execute = async () => {
    const input = customerInput.trim();
    if (!input) {
      setStatus({ status: "failed", logs: ["Enter a customer request first."] });
      return;
    }
    setStatus({ status: "queued", logs: [] });
    setRunId("");
    const r = await fetch("/api/execute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ graph, customerInput: input }) });
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

  return <div style={{ height: "calc(100vh - 68px)", display: "contents" }}>
    <aside className="sidebar">
      <h3 className="panel-title">Nodes</h3>
      <div className="node-card" onClick={addNode}><strong>+ Decision Node</strong><span>Add an AI YES/NO decision step</span></div>
      <div className="help"><b>How to use</b><br />Enter a customer request, then run the workflow. Select a node to edit its prompt. Connect output handles to another node.</div>
    </aside>
    <section className="canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, n) => setSelected(n.id)} fitView><Background /><Controls /><MiniMap /></ReactFlow></section>
    <aside className="rightbar">
      <div className="section">
        <h3 className="panel-title">Customer Request</h3>
        <textarea value={customerInput} onChange={(e) => setCustomerInput(e.target.value)} placeholder="Example: My laptop is not working and I need urgent technical support." style={{ width: "100%", minHeight: 90, padding: 10, resize: "vertical" }} />
      </div>
      <div className="section">
        <h3 className="panel-title">Decision Node</h3>
        {selectedNode ? <><div className="field"><label>Node name</label><input value={String(selectedNode.data.label)} onChange={(e) => setNodes((ns) => ns.map((n) => n.id === selected ? { ...n, data: { ...n.data, label: e.target.value } } : n))} /></div><div className="field"><label>Prompt</label><textarea value={String(selectedNode.data.prompt)} onChange={(e) => updatePrompt(e.target.value)} /></div></> : <p>Select a node.</p>}
      </div>
      <div className="section"><button className="btn primary" style={{ width: "100%" }} onClick={execute}>Run AI Workflow</button><button className="btn" style={{ width: "100%", marginTop: 8 }} onClick={() => { localStorage.setItem("decision-flow", JSON.stringify(graph)); alert("Workflow saved locally."); }}>Save Workflow</button></div>
      <div><h3 className="panel-title">Execution</h3><div className="status"><span className={`dot ${status?.status || ""}`}></span>{status?.status || "idle"}</div>{status?.logs?.map((l: string, i: number) => <div className="log" key={i}>{l}</div>)}</div>
    </aside>
  </div>;
}
