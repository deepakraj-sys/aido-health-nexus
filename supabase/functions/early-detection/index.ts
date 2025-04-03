
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/edge-config.ts";

// OpenAI API integration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Early detection system prompt
const SYSTEM_PROMPT = `
You are AidoHealth's AI Early Detection System. Your task is to analyze patient data to identify potential early signs of conditions that could lead to disabilities if untreated.

Based on the provided patient data, vital signs, symptoms, and medical history:
1. Identify potential risk factors and early warning signs
2. Suggest possible conditions that should be investigated by healthcare professionals
3. Recommend preventive measures or further tests
4. Provide risk assessment on a scale from Low to High

Important: Make it clear that this is an AI-assisted screening tool only, not a diagnostic system. All findings should be reviewed by qualified healthcare professionals.
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
    const { patientData, vitalSigns, symptoms, medicalHistory } = requestData;

    if (!patientData) {
      throw new Error("No patient data provided");
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `
          Please analyze the following patient data for early detection of potential health issues:
          
          Patient Information:
          ${JSON.stringify(patientData, null, 2)}
          
          ${vitalSigns ? `Vital Signs:\n${JSON.stringify(vitalSigns, null, 2)}` : ''}
          
          ${symptoms ? `Symptoms:\n${JSON.stringify(symptoms, null, 2)}` : ''}
          
          ${medicalHistory ? `Medical History:\n${JSON.stringify(medicalHistory, null, 2)}` : ''}
          
          Based on this data, please provide:
          1. A risk assessment
          2. Potential early warning signs identified
          3. Recommended follow-up actions or tests
          4. Preventive measures
        `
      }
    ];

    // Call OpenAI API
    console.log("Calling OpenAI API for early detection...");
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
        max_tokens: 1000
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await openAIResponse.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the response to extract structured data
    const responseLines = aiResponse.split('\n');
    const riskLevel = /risk assessment:(.+)/i.test(aiResponse) 
      ? aiResponse.match(/risk assessment:(.+)/i)[1].trim().toLowerCase() 
      : 'unknown';
    
    let overallRisk;
    if (riskLevel.includes('high')) {
      overallRisk = 'high';
    } else if (riskLevel.includes('moderate')) {
      overallRisk = 'moderate';
    } else {
      overallRisk = 'low';
    }

    // Extract warning signs and recommendations
    const warningSignsMatch = aiResponse.match(/warning signs identified:([\s\S]*?)(?=\d\.|\n\n|$)/i);
    const recommendationsMatch = aiResponse.match(/recommended follow-up actions or tests:([\s\S]*?)(?=\d\.|\n\n|$)/i);
    const preventiveMeasuresMatch = aiResponse.match(/preventive measures:([\s\S]*?)(?=\d\.|\n\n|$)/i);
    
    const warningSignsText = warningSignsMatch ? warningSignsMatch[1].trim() : '';
    const recommendationsText = recommendationsMatch ? recommendationsMatch[1].trim() : '';
    const preventiveMeasuresText = preventiveMeasuresMatch ? preventiveMeasuresMatch[1].trim() : '';
    
    // Extract bullet points
    const extractBulletPoints = (text) => {
      const lines = text.split('\n').map(line => line.replace(/^-\s*|^\*\s*|\d+\.\s+/, '').trim()).filter(Boolean);
      return lines.length > 0 ? lines : [text];
    };

    // Create structured response
    const structuredResponse = {
      analysisText: aiResponse,
      structuredAnalysis: {
        overallRisk,
        factors: extractBulletPoints(warningSignsText),
        recommendations: extractBulletPoints(recommendationsText + '\n' + preventiveMeasuresText)
      }
    };

    return new Response(
      JSON.stringify(structuredResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Early detection error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
