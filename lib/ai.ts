type DecisionAnswer = "YES" | "NO";

function getModelConfig() {
  const endpoint =
    process.env.MODEL_ENDPOINT ||
    "https://api.groq.com/openai/v1/chat/completions";
  const key = process.env.MODEL_API_KEY || process.env.GROQ_API_KEY;
  const model = process.env.MODEL_NAME || "llama-3.1-8b-instant";

  if (!key) {
    throw new Error("Configure GROQ_API_KEY (or MODEL_API_KEY) in .env.local.");
  }

  return { endpoint, key, model };
}

export async function askDecision(
  decisionPrompt: string,
  customerRequest: string,
): Promise<DecisionAnswer> {
  const { endpoint, key, model } = getModelConfig();
  const prompt = `Customer request:\n${customerRequest.trim()}\n\nDecision question:\n${decisionPrompt.trim()}\n\nReturn exactly YES or NO. Do not explain.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0,
        max_completion_tokens: 2,
        messages: [
          {
            role: "system",
            content:
              "You are a workflow decision classifier. Evaluate the customer request against the decision question. Return exactly YES or NO. Never explain.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(
        `Model request failed: ${response.status}${body ? ` - ${body.slice(0, 300)}` : ""}`,
      );
    }

    let data: any;
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error("Model returned invalid JSON.");
    }

    const text = String(data?.choices?.[0]?.message?.content || "")
      .trim()
      .toUpperCase();
    const match = text.match(/\b(YES|NO)\b/);
    if (!match) throw new Error(`Unexpected model response: ${text}`);
    return match[1] as DecisionAnswer;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI request timed out after 15 seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
