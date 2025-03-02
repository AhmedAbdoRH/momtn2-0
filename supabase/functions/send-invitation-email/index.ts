
// Follow this setup guide to integrate the Deno runtime and Supabase
// https://deno.land/manual/getting_started/setup_your_environment
// https://deno.land/manual/examples/supabase

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get request data
    const { invitationToken, spaceId, email, inviterUserId, spaceName } = await req.json();

    // Validate required data
    if (!invitationToken || !spaceId || !email || !inviterUserId || !spaceName) {
      return new Response(
        JSON.stringify({ error: "Missing required information" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get inviter details
    const { data: inviterData, error: inviterError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', inviterUserId)
      .single();

    const inviterName = inviterData?.name || "مستخدم";

    // Generate invitation URL
    const baseUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const invitationUrl = `${baseUrl}/invitation?token=${invitationToken}`;

    // In a real implementation, you would:
    // 1. Use a proper email service like SendGrid, Resend, etc.
    // 2. Create a nice HTML email with your branding
    // 3. Send the email using the service's API

    console.log(`
      Sending invitation email to: ${email}
      Space: ${spaceName}
      Inviter: ${inviterName}
      Invitation URL: ${invitationUrl}
    `);

    // For now, we'll just return a success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation email would be sent here in production" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error sending invitation email:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
