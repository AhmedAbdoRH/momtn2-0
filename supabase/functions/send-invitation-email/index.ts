
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { render } from "https://esm.sh/react-email@2.0.0/render";
import { SpaceInvitationEmail } from "./email-template.tsx";

// تكوين عناوين CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handleCors = (req: Request) => {
  // التعامل مع طلبات CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

serve(async (req) => {
  // التحقق من طلبات CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // تكوين عميل Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // استخراج بيانات المستخدم الحالي
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "يجب تسجيل الدخول لإرسال الدعوات" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // استخراج بيانات الدعوة من الطلب
    const { invitationId, spaceName } = await req.json();

    if (!invitationId || !spaceName) {
      return new Response(
        JSON.stringify({ error: "البيانات المطلوبة غير مكتملة" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // جلب معلومات الدعوة من قاعدة البيانات
    const { data: invitationData, error: invitationError } = await supabaseClient
      .from("space_invitations")
      .select("*")
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitationData) {
      return new Response(
        JSON.stringify({ error: "لم يتم العثور على الدعوة" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // جلب اسم المستخدم المرسل
    const senderName = user.email?.split("@")[0] || "مستخدم";
    const recipientName = invitationData.email.split("@")[0];

    // إنشاء رابط الدعوة
    const baseUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";
    const inviteLink = `${baseUrl}/invite?token=${invitationData.token}`;

    // إنشاء قالب البريد الإلكتروني
    const emailHtml = render(
      SpaceInvitationEmail({
        recipientName,
        senderName,
        spaceName,
        inviteLink,
      })
    );

    // إرسال البريد الإلكتروني باستخدام خدمة البريد المفضلة لديك
    // هنا نستخدم خدمة وهمية للعرض فقط
    console.log(`إرسال بريد إلكتروني إلى ${invitationData.email}`);
    console.log(`رابط الدعوة: ${inviteLink}`);

    // إرجاع استجابة نجاح
    return new Response(
      JSON.stringify({
        success: true,
        message: `تم إرسال الدعوة إلى ${invitationData.email}`,
        inviteLink,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("حدث خطأ:", error);

    return new Response(
      JSON.stringify({ error: "حدث خطأ أثناء معالجة الطلب" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
