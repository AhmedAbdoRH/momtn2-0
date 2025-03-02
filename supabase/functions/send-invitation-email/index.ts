
// Follow this setup guide to integrate the Deno runtime and Supabase
// https://deno.land/manual/getting_started/setup_your_environment
// https://deno.land/manual/examples/supabase

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set in environment variables");
    }
    
    const resend = new Resend(resendApiKey);
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

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Emtnan App <onboarding@resend.dev>',
      to: [email],
      subject: `دعوة للانضمام إلى مساحة "${spaceName}"`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h1 style="color: #ea384c; text-align: center;">دعوة للانضمام إلى مساحة مشتركة</h1>
          <p style="font-size: 16px; line-height: 1.5;">مرحباً،</p>
          <p style="font-size: 16px; line-height: 1.5;">
            لقد قام <strong>${inviterName}</strong> بدعوتك للانضمام إلى مساحة "<strong>${spaceName}</strong>" في تطبيق الامتنان.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" style="background-color: #ea384c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              قبول الدعوة
            </a>
          </div>
          <p style="font-size: 14px; line-height: 1.5;">
            أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:
          </p>
          <p style="font-size: 14px; word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
            ${invitationUrl}
          </p>
          <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Email sent successfully to:", email);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation email sent successfully" 
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
