export async function askDecision(prompt:string):Promise<"YES"|"NO">{
 const endpoint=process.env.MODEL_ENDPOINT;
 const key=process.env.MODEL_API_KEY;
 if(!endpoint||!key) throw new Error("Configure MODEL_ENDPOINT and MODEL_API_KEY in .env.local.");
 const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},body:JSON.stringify({model:process.env.MODEL_NAME||"llama-3.3-70b-versatile",temperature:0,messages:[{role:"system",content:"Return exactly YES or NO."},{role:"user",content:prompt}]})});
 if(!response.ok) throw new Error(`Model request failed: ${response.status}`);
 const data=await response.json();
 const text=String(data?.choices?.[0]?.message?.content||"").trim().toUpperCase();
 return text.startsWith("YES")?"YES":"NO";
}
