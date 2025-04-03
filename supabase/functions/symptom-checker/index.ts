
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/edge-config.ts";

// OpenAI API integration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Symptom checker system prompt
const SYSTEM_PROMPT = `
You are AidoHealth's AI Symptom Checker. Your purpose is to analyze symptoms reported by the user and provide potential causes, severity assessment, and recommended actions.

For each symptom analysis, you should provide:
1. A list of potential causes or conditions associated with the symptoms
2. A severity assessment (mild, moderate, severe)
3. Recommended actions (self-care, consult doctor, seek emergency care)
4. Home care recommendations when appropriate
5. Warning signs that would require medical attention

Important: Always include a disclaimer that this is not a diagnosis and users should consult with healthcare professionals. Never claim to provide definitive diagnoses.
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
    const { symptomName, severity, duration, notes, userDetails } = requestData;

    if (!symptomName) {
      throw new Error("Symptom name is required");
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `
          Please analyze the following symptom:
          
          Symptom: ${symptomName}
          ${severity !== undefined ? `Severity (1-10): ${severity}` : ''}
          ${duration ? `Duration: ${duration}` : ''}
          ${notes ? `Additional notes: ${notes}` : ''}
          ${userDetails ? `Patient details: ${JSON.stringify(userDetails)}` : ''}
          
          Based on this information, please provide:
          1. Potential causes
          2. Severity assessment
          3. Recommended actions
          4. Home care suggestions
          5. Warning signs that would require immediate medical attention
        `
      }
    ];

    // Call OpenAI API
    console.log("Calling OpenAI API for symptom analysis...");
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: messages,
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await openAIResponse.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the response to extract structured data
    const severityMatch = /severity assessment:(.+)/i.exec(aiResponse);
    const actionMatch = /recommended actions:(.+)/i.exec(aiResponse);
    
    // Extract different sections
    const potentialCausesMatch = aiResponse.match(/potential causes:([\s\S]*?)(?=\d\.|\n\n|$)/i);
    const recommendationsMatch = aiResponse.match(/home care suggestions:([\s\S]*?)(?=\d\.|\n\n|$)/i);
    const warningSignsMatch = aiResponse.match(/warning signs:([\s\S]*?)(?=\d\.|\n\n|$)/i);
    
    // Extract bullet points function
    const extractBulletPoints = (text) => {
      if (!text) return [];
      const lines = text.split('\n').map(line => line.replace(/^-\s*|^\*\s*|\d+\.\s+/, '').trim()).filter(Boolean);
      return lines.length > 0 ? lines : [text];
    };

    // Create structured response
    const structuredResponse = {
      analysisText: aiResponse,
      structuredAnalysis: {
        severity: severityMatch ? severityMatch[1].trim() : 'unknown',
        recommendedAction: actionMatch ? actionMatch[1].trim() : 'unknown',
        potentialCauses: potentialCausesMatch ? extractBulletPoints(potentialCausesMatch[1]) : [],
        homeCare: recommendationsMatch ? extractBulletPoints(recommendationsMatch[1]) : [],
        warningSigns: warningSignsMatch ? extractBulletPoints(warningSignsMatch[1]) : []
      }
    };

    return new Response(
      JSON.stringify(structuredResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Symptom checker error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
