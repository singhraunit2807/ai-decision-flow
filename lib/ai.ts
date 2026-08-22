export async function askDecision(prompt: string): Promise<"YES" | "NO"> {
  const endpoint = process.env.MODEL_ENDPOINT;
  const key = process.env.MODEL_API_KEY;
  const model = process.env.MODEL_NAME || "openai/gpt-oss-120b";

  if (!endpoint || !key) {
    throw new Error("Configure MODEL_ENDPOINT and MODEL_API_KEY in .env.local.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 3,
      messages: [
        {
          role: "system",
          content:
            'Classify the customer request against the decision question. Return exactly one word: YES or NO. No punctuation or explanation.',
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Model request failed: ${response.status} ${body}`);
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
  if (!match) {
    throw new Error(`Unexpected model response: ${text}`);
  }

  return match[1] as "YES" | "NO";
}
