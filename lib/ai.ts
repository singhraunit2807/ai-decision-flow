type DecisionAnswer = "YES" | "NO";

function getModelConfig() {
  const endpoint = process.env.MODEL_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions";
  const key = process.env.MODEL_API_KEY || process.env.GROQ_API_KEY;
  const model = process.env.MODEL_NAME || "llama-3.3-70b-versatile";
  if (!key) throw new Error("Configure GROQ_API_KEY (or MODEL_API_KEY) in .env.local.");
  return { endpoint, key, model };
}

export async function askDecision(decisionPrompt: string, customerRequest: string): Promise<DecisionAnswer> {
  const { endpoint, key, model } = getModelConfig();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 5,
      messages: [
        {
          role: "system",
          content:
            "You are a workflow decision classifier. Evaluate the customer's request against the current decision question. Return exactly YES or NO. Do not explain. Do not answer from the question alone.",
        },
        {
          role: "user",
          content: `Customer request:\n${customerRequest.trim()}\n\nCurrent decision question:\n${decisionPrompt.trim()}\n\nReturn exactly YES or NO.`,
        },
      ],
    }),
  });

  const body = await response.text();
  if (!response.ok) throw new Error(`Model request failed: ${response.status}${body ? ` - ${body.slice(0, 300)}` : ""}`);

  let data: any;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error("Model returned invalid JSON.");
  }

  const text = String(data?.choices?.[0]?.message?.content || "").trim().toUpperCase();
  const match = text.match(/\b(YES|NO)\b/);
  if (!match) throw new Error(`Unexpected model response: ${text}`);
  return match[1] as DecisionAnswer;
}
