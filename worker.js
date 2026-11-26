// Cloudflare Worker: OpenAI proxy for the DM website.
// Set OPENAI_API_KEY as a Worker secret. Never put it in index.html.
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";
    const corsOrigin = allowedOrigin === "*" || allowedOrigin === origin ? origin : "null";
    const headers = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (new URL(request.url).pathname !== "/chat") return json({ error: "Not found" }, 404, headers);
    if (request.method !== "POST") return json({ error: "POST only" }, 405, headers);
    if (!env.OPENAI_API_KEY) return json({ error: "서버에 OPENAI_API_KEY Secret이 설정되지 않았어." }, 500, headers);

    try {
      const body = await request.json();
      const character = body.character || {};
      const history = Array.isArray(body.history) ? body.history.slice(-24) : [];
      const systemPrompt = [
        "너는 아래 설정을 가진 가상 캐릭터다. 캐릭터의 말투와 성격을 일관되게 유지하고, 한국어로 자연스럽게 대화한다.",
        "대화 상대에게 캐릭터 설정을 설명하거나 AI라고 밝히지 말고 실제 메신저 대화처럼 답한다.",
        "상대의 메시지에 직접 반응하며, 불필요하게 장황한 설명이나 소설식 지문을 남발하지 않는다.",
        "캐릭터 설정이 비어 있거나 불명확한 부분은 임의로 사실처럼 만들지 않는다.",
        "캐릭터 이름: " + (character.name || "캐릭터 이름"),
        "프로필: " + (character.bio || ""),
        "캐릭터 설정: " + (character.prompt || "")
      ].join("\n\n");
      const messages = [{ role: "system", content: systemPrompt }];
      for (const item of history) {
        if ((item.role === "user" || item.role === "assistant") && typeof item.content === "string") {
          messages.push({ role: item.role, content: item.content.slice(0, 6000) });
        }
      }
      if (typeof body.message !== "string" || !body.message.trim()) return json({ error: "메시지가 비어 있어." }, 400, headers);
      // The latest user message is included in history by the browser; add it only if absent.
      const last = messages[messages.length - 1];
      if (!last || last.role !== "user" || last.content !== body.message) {
        messages.push({ role: "user", content: body.message.slice(0, 6000) });
      }
      const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.OPENAI_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4o-mini",
          messages,
          temperature: 0.85,
          max_tokens: 700
        })
      });
      const result = await apiResponse.json();
      if (!apiResponse.ok) return json({ error: result.error?.message || "OpenAI API 요청 실패" }, apiResponse.status, headers);
      const reply = result.choices?.[0]?.message?.content;
      if (!reply) return json({ error: "AI 답변이 비어 있어." }, 502, headers);
      return json({ reply }, 200, headers);
    } catch (error) {
      return json({ error: error.message || "서버 내부 오류" }, 500, headers);
    }
  }
};
function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" }
  });
}
