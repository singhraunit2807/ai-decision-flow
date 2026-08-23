"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ["start","support","yes","YES"],["start","sales","no","NO"],["support","resolution","yes","YES"],["support","end","no","NO"],
  ["resolution","remote","yes","YES"],["resolution","manual","no","NO"],["remote","resolved","yes","YES"],["remote","escalation","no","NO"],
  ["resolved","end","yes","YES"],["resolved","escalation","no","NO"],["escalation","expert","yes","YES"],["escalation","manual","no","NO"],
  ["expert","expertComplete","yes","YES"],["expert","manual","no","NO"],["expertComplete","end","yes","YES"],["expertComplete","expertFailed","no","NO"],
  ["expertFailed","alternative","yes","YES"],["expertFailed","manual","no","NO"],["alternative","alternativeComplete","yes","YES"],["alternative","manual","no","NO"],
  ["alternativeComplete","end","yes","YES"],["alternativeComplete","ticket","no","NO"],["manual","ticket","yes","YES"],["manual","end","no","NO"],
  ["ticket","end","yes","YES"],["ticket","end","no","NO"],["sales","salesAssist","yes","YES"],["sales","end","no","NO"],
  ["salesAssist","purchase","yes","YES"],["salesAssist","end","no","NO"],["purchase","end","yes","YES"],["purchase","end","no","NO"]
].map(([source,target,handle,label]) => ({ id:`${source}-${handle}-${target}`, source, target, sourceHandle:handle, label, type:"smoothstep" }));

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState("start");
  const [status, setStatus] = useState<any>(null);
  const [runId, setRunId] = useState("");
  const [customerRequest, setCustomerRequest] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const nodeTypes = useMemo(() => ({ decision: DecisionNode }), []);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target || !c.sourceHandle) return;
    const branch = c.sourceHandle === "no" ? "NO" : "YES";
    setEdges(es => addEdge({ ...c, id:`${c.source}-${branch}-${c.target}`, label:branch, type:"smoothstep" }, es));
  }, [setEdges]);

  const updatePrompt = (value: string) => setNodes(ns => ns.map(n => n.id === selected ? { ...n, data:{...n.data,prompt:value} } : n));
  const updateLabel = (value: string) => setNodes(ns => ns.map(n => n.id === selected ? { ...n, data:{...n.data,label:value} } : n));

  const addNode = () => {
    const id = `node-${Date.now()}`;
    setNodes(ns => [...ns,{ id,type:"decision",position:{x:150+ns.length*20,y:520+ns.length*15},data:{label:`Decision ${ns.length+1}`,prompt:"Should this decision continue?"} }]);
    setSelected(id);
  };

  const graph: WorkflowGraph = {
    nodes:nodes.map(n => ({id:n.id,label:String(n.data.label),prompt:String(n.data.prompt),position:n.position})),
    edges:edges.map(e => ({id:e.id,source:e.source,target:e.target,branch:e.sourceHandle === "no" ? "NO" : "YES"}))
  };

  const execute = async () => {
    if (!customerRequest.trim()) { setStatus({status:"failed",logs:["Customer request is required."]}); return; }
    setStatus({status:"queued",logs:[]}); setRunId("");
    try {
      const r = await fetch("/api/execute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({graph,customerRequest})});
      const d = await r.json();
      if (!r.ok) { setStatus({status:"failed",logs:[d.error || "Execution failed."]}); return; }
      setRunId(d.runId);
    } catch (e) { setStatus({status:"failed",logs:[e instanceof Error ? e.message : "Execution failed."]}); }
  };

  useEffect(() => {
    if (!runId) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/status?id=${runId}`); if (!r.ok) return;
        const d = await r.json(); setStatus(d);
        if (d.status === "completed" || d.status === "failed") clearInterval(t);
      } catch {}
    },700);
    return () => clearInterval(t);
  },[runId]);

  const saveWorkflow = () => { localStorage.setItem("decision-flow",JSON.stringify(graph)); setStatus({status:"completed",logs:["Workflow saved locally."]}); };
  const loadWorkflow = () => {
    try {
      const raw = localStorage.getItem("decision-flow"); if (!raw) throw new Error("No saved workflow found.");
      const saved = JSON.parse(raw) as WorkflowGraph;
      if (!saved.nodes?.length) throw new Error("Saved workflow is invalid.");
      setNodes(saved.nodes.map(n => ({id:n.id,type:"decision",position:n.position,data:{label:n.label,prompt:n.prompt}})));
      setEdges(saved.edges.map(e => ({id:e.id,source:e.source,target:e.target,sourceHandle:e.branch === "NO" ? "no" : "yes",label:e.branch,type:"smoothstep"})));
      setSelected(saved.nodes[0].id); setStatus({status:"completed",logs:["Workflow loaded."]});
    } catch (e) { setStatus({status:"failed",logs:[e instanceof Error ? e.message : "Could not load workflow."]}); }
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(graph,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="decision-flow.json"; a.click(); URL.revokeObjectURL(url);
  };
  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const saved = JSON.parse(String(reader.result)) as WorkflowGraph;
        if (!saved.nodes?.length || !saved.edges) throw new Error("Invalid workflow JSON.");
        setNodes(saved.nodes.map(n => ({id:n.id,type:"decision",position:n.position,data:{label:n.label,prompt:n.prompt}})));
        setEdges(saved.edges.map(e => ({id:e.id,source:e.source,target:e.target,sourceHandle:e.branch === "NO" ? "no" : "yes",label:e.branch,type:"smoothstep"})));
        setSelected(saved.nodes[0].id); setStatus({status:"completed",logs:["Workflow imported."]});
      } catch (e) { setStatus({status:"failed",logs:[e instanceof Error ? e.message : "Could not import workflow."]}); }
    };
    reader.readAsText(file);
  };

  const activeNode = status?.currentNode;
  const displayNodes = nodes.map(n => ({...n,data:{...n.data,active:n.id === activeNode}}));
  const displayEdges = edges.map(e => ({...e,animated:Boolean(activeNode && e.source === activeNode)}));
  const selectedNode = nodes.find(n => n.id === selected);

  return <div style={{height:"calc(100vh - 68px)",display:"contents"}}>
    <aside className="sidebar">
      <h3 className="panel-title">Nodes</h3>
      <div className="node-card" onClick={addNode}><strong>+ Decision Node</strong><span>Add an AI YES/NO decision step</span></div>
      <div className="help"><b>How to use</b><br/>Enter a customer request and run the workflow.<br/>Select a node to edit its prompt.<br/>Left output is YES and right output is NO.</div>
    </aside>

    <section className="canvas"><ReactFlow nodes={displayNodes} edges={displayEdges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_,n)=>setSelected(n.id)} fitView><Background/><Controls/><MiniMap/></ReactFlow></section>

    <aside className="rightbar">
      <div className="section"><h3 className="panel-title">Customer Request</h3><div className="field"><textarea value={customerRequest} onChange={e=>setCustomerRequest(e.target.value)} placeholder="Example: My laptop is broken and I need urgent technical support." aria-label="Customer request"/></div></div>
      <div className="section"><h3 className="panel-title">Decision Node</h3>{selectedNode ? <><div className="field"><label>Node name</label><input value={String(selectedNode.data.label)} onChange={e=>updateLabel(e.target.value)}/></div><div className="field"><label>Prompt</label><textarea value={String(selectedNode.data.prompt)} onChange={e=>updatePrompt(e.target.value)}/></div></> : <p>Select a node.</p>}</div>
      <div className="section">
        <button className="btn primary" style={{width:"100%"}} onClick={execute}>Run AI Workflow</button>
        <button className="btn" style={{width:"100%",marginTop:8}} onClick={saveWorkflow}>Save Workflow</button>
        <button className="btn" style={{width:"100%",marginTop:8}} onClick={loadWorkflow}>Load Workflow</button>
        <button className="btn" style={{width:"100%",marginTop:8}} onClick={exportJSON}>Export JSON</button>
        <input ref={fileInput} type="file" accept="application/json" hidden onChange={e=>{const f=e.target.files?.[0];if(f)importJSON(f);e.currentTarget.value="";}}/>
        <button className="btn" style={{width:"100%",marginTop:8}} onClick={()=>fileInput.current?.click()}>Import JSON</button>
      </div>
      <div><h3 className="panel-title">Execution</h3><div className="status"><span className={`dot ${status?.status || ""}`}></span>{status?.status || "idle"}</div>{status?.logs?.map((l:string,i:number)=><div className="log" key={i}>{l}</div>)}</div>
    </aside>
  </div>;
}
