
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendVerificationEmailRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: SendVerificationEmailRequest = await req.json();
    
    if (!email || !code) {
      throw new Error("Email and verification code are required");
    }

    // Brevo API configuration
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    // Send email via Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "تطبيقك",
          email: "noreply@yourdomain.com" // Replace with your verified sender email
        },
        to: [
          {
            email: email,
            name: "المستخدم"
          }
        ],
        subject: "رمز التحقق من البريد الإلكتروني",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
            <h2 style="color: #4A5568;">مرحباً!</h2>
            <p>شكراً على تسجيلك في تطبيقنا. فيما يلي رمز التحقق الخاص بك:</p>
            <div style="background-color: #F7FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 8px; color: #4A5568;">${code}</span>
            </div>
            <p>يرجى إدخال هذا الرمز في صفحة التحقق لإكمال عملية التسجيل.</p>
            <p>إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
            <p>مع التحية،<br>فريق التطبيق</p>
          </div>
        `
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Error sending email:", responseData);
      throw new Error(`Error sending email: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({ success: true, message: "Verification email sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
