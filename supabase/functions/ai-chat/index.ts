import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, productCatalog, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const catalogText = productCatalog
      .map((p: any) => `ID:${p.id} | ${p.title} | $${p.price} | Category:${p.category} | Tags:${p.tags.join(",")}`)
      .join("\n");

    const behaviorBlock = userContext
      ? `\n\nUSER CONTEXT:\n${userContext}\nUse this context to personalize recommendations. When suggesting products, always explain WHY you chose them based on the user's behavior (e.g. "Based on your interest in sneakers..." or "Since you have running shoes in your cart...").`
      : "";

    const systemMessage = {
      role: "system",
      content: `You are SmartBot, an AI shopping assistant for AI SmartShop e-commerce store. You help users find products, compare options, and make purchase decisions.

PRODUCT CATALOG:
${catalogText}
${behaviorBlock}

RULES:
- Be friendly, helpful, and concise
- When recommending products, ALWAYS explain your reasoning based on the user's behavior, preferences, or query context
- Include product IDs in your response wrapped like [PRODUCT:id] so the UI can render product cards
- If asked about products not in catalog, say so politely
- You can suggest categories, compare products, help with gifting ideas
- Use emojis sparingly for a modern feel
- Keep responses under 200 words`,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [systemMessage, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
