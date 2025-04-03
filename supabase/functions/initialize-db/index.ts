
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient, corsHeaders } from "../_shared/edge-config.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Read the SQL file
    const sqlSetup = `
-- Function to get appointments with patient and doctor profiles
CREATE OR REPLACE FUNCTION get_doctor_appointments(doctor_id UUID)
RETURNS TABLE (
  id UUID,
  patient_id UUID,
  doctor_id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  doctor JSONB,
  patient JSONB
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.start_time,
    a.end_time,
    a.status,
    a.notes,
    a.created_at,
    to_jsonb(doc) AS doctor,
    to_jsonb(pat) AS patient
  FROM 
    appointments a
  JOIN 
    profiles doc ON a.doctor_id = doc.id
  JOIN 
    profiles pat ON a.patient_id = pat.id
  WHERE 
    a.doctor_id = doctor_id
  ORDER BY 
    a.start_time ASC;
$$;

-- Function to get patient appointments with doctor profiles
CREATE OR REPLACE FUNCTION get_patient_appointments(patient_id UUID)
RETURNS TABLE (
  id UUID,
  patient_id UUID,
  doctor_id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  doctor JSONB,
  patient JSONB
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.start_time,
    a.end_time,
    a.status,
    a.notes,
    a.created_at,
    to_jsonb(doc) AS doctor,
    to_jsonb(pat) AS patient
  FROM 
    appointments a
  JOIN 
    profiles doc ON a.doctor_id = doc.id
  JOIN 
    profiles pat ON a.patient_id = pat.id
  WHERE 
    a.patient_id = patient_id
  ORDER BY 
    a.start_time ASC;
$$;

-- Function to get patient records with vital signs and risk assessments
CREATE OR REPLACE FUNCTION get_patient_records_with_details()
RETURNS TABLE (
  id UUID,
  age INT,
  condition TEXT,
  created_at TIMESTAMPTZ,
  last_visit TIMESTAMPTZ,
  medical_history TEXT[],
  name TEXT,
  status TEXT,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  vital_signs JSONB,
  ai_risk_assessment JSONB
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pr.id,
    pr.age,
    pr.condition,
    pr.created_at,
    pr.last_visit,
    pr.medical_history,
    pr.name,
    pr.status,
    pr.updated_at,
    pr.user_id,
    to_jsonb(vs) AS vital_signs,
    to_jsonb(ra) AS ai_risk_assessment
  FROM 
    patient_records pr
  LEFT JOIN LATERAL (
    SELECT * FROM vital_signs 
    WHERE patient_id = pr.id 
    ORDER BY recorded_at DESC 
    LIMIT 1
  ) vs ON true
  LEFT JOIN LATERAL (
    SELECT * FROM ai_risk_assessments 
    WHERE patient_id = pr.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) ra ON true
  ORDER BY 
    pr.last_visit DESC;
$$;
    `;

    // Execute the SQL
    const { error } = await supabaseClient.rpc('exec_sql', { sql: sqlSetup });
    
    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Database initialized successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
