
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/edge-config.ts";

// OpenAI API integration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Health assistant system prompt
const SYSTEM_PROMPT = `
You are AidoHealth's AI Health Assistant. Provide accurate, helpful health information and advice to users.
Your responses should be:
- Medically accurate
- Empathetic and supportive
- Clear and concise
- Always include disclaimers when appropriate
- Suggest consulting healthcare providers when needed

Important: Never claim to diagnose conditions or prescribe treatments. Always defer to healthcare professionals for specific medical advice.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Validate API key
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Parse request body
    const requestData = await req.json();
    const { message, userContext } = requestData;

    if (!message) {
      throw new Error("No message provided");
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add user context if provided
    if (userContext) {
      messages.push({ 
        role: "system", 
        content: `User context: ${JSON.stringify(userContext)}` 
      });
    }

    // Add user message
    messages.push({ role: "user", content: message });

    // Call OpenAI API
    console.log("Calling OpenAI API...");
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await openAIResponse.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        response: aiResponse,
        model: data.model,
        usage: data.usage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Health assistant error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
