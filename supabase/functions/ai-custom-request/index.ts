import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, productCatalog } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const catalogText = productCatalog
      .map((p: any) => `ID:${p.id} | ${p.title} | $${p.price} | Category:${p.category} | Tags:${p.tags.join(",")}`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a product matching AI. Given a user's product description and a catalog, find matching products or explain why none match. Be concise and helpful.

CATALOG:
${catalogText}`,
          },
          { role: "user", content: `Find products matching: "${description}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_products",
              description: "Return matched product IDs and explanation",
              parameters: {
                type: "object",
                properties: {
                  matchedIds: { type: "array", items: { type: "string" }, description: "IDs of matching products (empty if none)" },
                  explanation: { type: "string", description: "Explanation of matches or why nothing matched" },
                },
                required: ["matchedIds", "explanation"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "match_products" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-custom-request error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
