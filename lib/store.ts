import type { WorkflowGraph } from "./types";
type Run={id:string;status:"queued"|"running"|"completed"|"failed";logs:string[];answers:Record<string,"YES"|"NO">;currentNode?:string;error?:string};
const runs=new Map<string,Run>();
export function createRun():Run{const id=crypto.randomUUID();const r:Run={id,status:"queued",logs:[],answers:{}};runs.set(id,r);return r;}
export function getRun(id:string){return runs.get(id);}
export function updateRun(id:string,patch:Partial<Run>){const r=runs.get(id);if(r)runs.set(id,{...r,...patch});}
export function appendLog(id:string,text:string){const r=runs.get(id);if(r)r.logs.push(text);}
export function validateGraph(graph:WorkflowGraph){if(!graph.nodes.length)throw new Error("Workflow must contain at least one node.");for(const n of graph.nodes)if(!n.prompt.trim())throw new Error(`Node ${n.label} has an empty prompt.`);}
