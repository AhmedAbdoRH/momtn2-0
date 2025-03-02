
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { Resend } from "https://esm.sh/resend@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailParams {
  invitationToken: string;
  email: string;
  inviterUserId: string;
  spaceId: string;
  spaceName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

    // Verify that we have the necessary environment variables
    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({
          error: "Server configuration error. Missing environment variables.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get the invitation data
    const { invitationToken, email, inviterUserId, spaceId, spaceName } = await req.json() as InvitationEmailParams;

    if (!invitationToken || !email || !inviterUserId || !spaceId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the inviter's details
    const { data: userData, error: userError } = await supabase
      .from("auth.users")
      .select("email")
      .eq("id", inviterUserId)
      .single();

    if (userError) {
      console.error("Error fetching user details:", userError);
      return new Response(
        JSON.stringify({ error: "Could not fetch inviter details" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const inviterEmail = userData.email || "someone";

    // Create the invitation link
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const invitationLink = `${origin}/invitation?token=${invitationToken}`;

    // Send the email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "امتنان <onboarding@resend.dev>",
      to: [email],
      subject: `دعوة للانضمام إلى مساحة ${spaceName} على امتنان`,
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h1 style="color: #ea384c; text-align: center;">دعوة للانضمام إلى مساحة مشتركة</h1>
          <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">مرحباً،</p>
          <p style="font-size: 16px; line-height: 1.5;">
            تمت دعوتك من قبل ${inviterEmail} للانضمام إلى مساحة "${spaceName}" المشتركة على منصة امتنان.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" style="background-color: #ea384c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              قبول الدعوة والانضمام إلى المساحة
            </a>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            هذه الدعوة صالحة لمدة 7 أيام فقط. إذا انتهت صلاحية الرابط، يرجى التواصل مع الشخص الذي دعاك للحصول على دعوة جديدة.
          </p>
          <p style="font-size: 14px; color: #666; text-align: center;">
            مع امتنان.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send invitation email" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Invitation email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
