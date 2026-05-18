import { useState } from "react";

const endpoint = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions";

export default function useAIAnalysis(systemPrompt, buildPrompt, fallback) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");

  async function generate(data) {
    setLoading(true);
    setError("");
    try {
      const token = import.meta.env.VITE_HF_TOKEN;
      if (!token) {
        setResponse(fallback ? fallback(data) : "Set VITE_HF_TOKEN in .env to enable Qwen analysis. This panel will update automatically once the token is available.");
        return;
      }
      const apiResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          max_tokens: 600,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: buildPrompt(data) },
          ],
        }),
      });
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Hugging Face request failed: ${apiResponse.status}. ${errorText.slice(0, 180)}`);
      }
      const json = await apiResponse.json();
      setResponse(json.choices?.[0]?.message?.content || "No analysis returned.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, response, generate };
}
