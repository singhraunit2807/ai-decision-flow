import {inngest} from "./client";
import {askDecision} from "@/lib/ai";
import {appendLog,updateRun} from "@/lib/store";
import type {WorkflowGraph} from "@/lib/types";
export const executeWorkflow=inngest.createFunction({id:"execute-ai-decision-workflow",retries:2},{event:"workflow/execute"},async({event,step})=>{
 const{runId,graph}=event.data as {runId:string;graph:WorkflowGraph};updateRun(runId,{status:"running"});let current=graph.nodes[0]?.id;const visited=new Set<string>();
 while(current&&!visited.has(current)){visited.add(current);updateRun(runId,{currentNode:current});const node=graph.nodes.find(n=>n.id===current);if(!node)break;const answer=await step.run(`decision-${node.id}`,()=>askDecision(node.prompt));appendLog(runId,`${node.label}: ${answer}`);const edge=graph.edges.find(e=>e.source===current&&e.branch===answer);if(!edge){appendLog(runId,"No matching branch. Workflow completed.");break}current=edge.target;await step.sleep(`pause-${node.id}`,"1s")}
 updateRun(runId,{status:"completed",currentNode:undefined});return{runId};
});
