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
    const { interest, imageBase64, productCatalog } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const catalogText = productCatalog
      .map((p: any) => `ID:${p.id} | ${p.title} | Category:${p.category} | Tags:${p.tags.join(",")} | $${p.price}`)
      .join("\n");

    const messages: any[] = [
      {
        role: "system",
        content: `You are an AI shopping assistant. Analyze preferences and recommend products from the catalog.

PRODUCT CATALOG:
${catalogText}

Respond with the tool provided. Select 3-6 best matching products. If an image is provided, also analyze its style, color tone, and category.`,
      },
    ];

    const userContent: any[] = [];
    if (imageBase64) {
      userContent.push({ type: "image_url", image_url: { url: imageBase64 } });
      userContent.push({
        type: "text",
        text: `Analyze this image's style, colors, and category. ${interest ? `User interested in: ${interest}.` : ""} Recommend matching products.`,
      });
    } else {
      userContent.push({ type: "text", text: `User interested in: ${interest}. Recommend best matching products.` });
    }

    messages.push({ role: "user", content: userContent });

    const toolParams: any = {
      type: "object",
      properties: {
        recommendedIds: { type: "array", items: { type: "string" }, description: "Product IDs to recommend" },
        explanation: { type: "string", description: "Personalized explanation starting with 'Based on your...'" },
      },
      required: ["recommendedIds", "explanation"],
      additionalProperties: false,
    };

    if (imageBase64) {
      toolParams.properties.style = { type: "string", description: "Detected style: Casual, Formal, Trendy, Sporty, or Minimalist" };
      toolParams.properties.colorTone = { type: "string", description: "Color tone: Light, Dark, Mixed, Warm, or Cool" };
      toolParams.properties.suggestedCategory = { type: "string", description: "Best matching product category" };
      toolParams.properties.analysisExplanation = { type: "string", description: "Brief explanation of image analysis" };
      toolParams.required.push("style", "colorTone", "suggestedCategory", "analysisExplanation");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [{
          type: "function",
          function: {
            name: "recommend_products",
            description: "Return product recommendations with optional image analysis",
            parameters: toolParams,
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_products" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No tool call in AI response");
  } catch (e) {
    console.error("ai-recommend error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
