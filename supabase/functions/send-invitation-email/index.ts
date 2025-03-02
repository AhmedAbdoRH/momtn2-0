import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { Resend } from "https://esm.sh/resend@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailParams {
  invitationToken: string;
  email: string;
  inviterEmail: string;
  spaceId: string;
  spaceName: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // بيئة التشغيل - جلب البيانات الحساسة
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration - Missing secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تهيئة Supabase + Resend
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // قراءة بيانات الدعوة من الطلب
    const { invitationToken, email, inviterEmail, spaceId, spaceName } = await req.json() as InvitationEmailParams;

    if (!invitationToken || !email || !inviterEmail || !spaceId || !spaceName) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // توليد رابط الدعوة
    const origin = req.headers.get("origin") || "https://your-production-frontend.com"; // عدلها لو تحب
    const invitationLink = `${origin}/invitation?token=${invitationToken}`;

    // إرسال الإيميل عبر Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "امتنان <noreply@yourdomain.com>", // لازم يكون Verified في Resend
      to: [email],
      subject: `دعوة للانضمام إلى مساحة ${spaceName} على امتنان`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #ea384c; text-align: center;">دعوة للانضمام إلى مساحة "${spaceName}"</h2>
          <p>مرحبًا،</p>
          <p>تمت دعوتك بواسطة <strong>${inviterEmail}</strong> للانضمام إلى مساحة مشتركة على منصة امتنان.</p>
          <p>للانضمام، اضغط على الرابط التالي:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${invitationLink}" style="background-color: #ea384c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              قبول الدعوة
            </a>
          </p>
          <p style="font-size: 14px; color: #888; text-align: center;">
            صلاحية الدعوة 7 أيام فقط.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Email sending failed:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send invitation email." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // استجابة النجاح
    return new Response(
      JSON.stringify({ success: true, message: "Invitation email sent successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
