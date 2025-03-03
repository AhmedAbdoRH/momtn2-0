
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from "npm:resend@1.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  invitationToken: string;
  spaceId: string;
  email: string;
  inviterUserId: string;
  spaceName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Missing RESEND_API_KEY environment variable" 
        }),
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const { invitationToken, spaceId, email, inviterUserId, spaceName }: EmailRequest = await req.json();
    
    console.log(`Sending invitation email to ${email} for space ${spaceName}`);
    console.log(`Invitation token: ${invitationToken}`);

    // Get inviter info
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.4');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: inviterUser, error: inviterError } = await supabase.auth
      .admin.getUserById(inviterUserId);
    
    if (inviterError) {
      console.error("Error fetching inviter user:", inviterError);
      throw new Error("Could not fetch inviter information");
    }

    // Get the full URL for this application
    const origin = req.headers.get('origin') || SUPABASE_URL;
    const invitationUrl = `${origin}/invitation?token=${invitationToken}`;
    
    console.log(`Invitation URL: ${invitationUrl}`);

    const result = await resend.emails.send({
      from: 'Shared Spaces <onboarding@resend.dev>',
      to: [email],
      subject: `دعوة للانضمام إلى ${spaceName}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>دعوة للانضمام إلى مساحة مشتركة</h2>
          <p>مرحباً،</p>
          <p>تم دعوتك من قبل ${inviterUser?.user?.email || 'مستخدم'} للانضمام إلى المساحة المشتركة: <strong>${spaceName}</strong></p>
          <div style="margin: 25px 0;">
            <a href="${invitationUrl}" style="background-color: #ea384c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              انقر هنا لقبول الدعوة
            </a>
          </div>
          <p>أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:</p>
          <p style="color: #666;">${invitationUrl}</p>
          <p>تنتهي صلاحية هذه الدعوة بعد 7 أيام.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px;">تم إرسال هذه الرسالة لأنك تلقيت دعوة للانضمام إلى مساحة مشتركة.</p>
        </div>
      `,
    });

    console.log("Resend API response:", result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  } catch (error) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  }
};

serve(handler);
