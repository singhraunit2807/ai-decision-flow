export type DecisionNode = { id:string; label:string; prompt:string; position:{x:number;y:number} };
export type DecisionEdge = { id:string; source:string; target:string; branch:"YES"|"NO" };
export type WorkflowGraph = { nodes:DecisionNode[]; edges:DecisionEdge[] };
