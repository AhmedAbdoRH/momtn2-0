
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      console.error('Token is missing in request body');
      return new Response(
        JSON.stringify({ success: false, message: 'Token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log("Processing join request with token:", token);

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, message: 'يجب تسجيل الدخول أولاً للانضمام إلى المساحة المشتركة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get user data to verify authentication
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('Failed to get user data:', userError);
      return new Response(
        JSON.stringify({ success: false, message: 'فشل التحقق من هوية المستخدم' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    console.log("User verified:", userData.user.id);

    // Verify invitation token
    const { data: invitationData, error: invitationError } = await supabase
      .from('space_invitations')
      .select('space_id, invited_by, status')
      .eq('token', token)
      .eq('status', 'active')
      .gte('expires_at', 'now()')
      .single();

    if (invitationError || !invitationData) {
      console.error('Invalid invitation:', invitationError);
      return new Response(
        JSON.stringify({ success: false, message: 'رمز الدعوة غير صالح أو منتهي الصلاحية' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log("Invitation verified for space:", invitationData.space_id);
    
    // Verify space exists
    const { data: spaceData, error: spaceError } = await supabase
      .from('spaces')
      .select('id, name')
      .eq('id', invitationData.space_id)
      .single();
    
    if (spaceError || !spaceData) {
      console.error('Space not found:', spaceError);
      return new Response(
        JSON.stringify({ success: false, message: 'المساحة المشتركة غير موجودة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log("Space verified:", spaceData.name);
    
    // Check if user is already a member
    const { data: memberData, error: memberError } = await supabase
      .from('space_members')
      .select('id')
      .eq('space_id', invitationData.space_id)
      .eq('user_id', userData.user.id)
      .maybeSingle();
    
    if (memberData) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          space_id: invitationData.space_id,
          message: 'أنت عضو بالفعل في هذه المساحة'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    // Add user to space
    const { data: insertData, error: insertError } = await supabase
      .from('space_members')
      .insert({
        space_id: invitationData.space_id,
        user_id: userData.user.id,
        invited_by: invitationData.invited_by,
        role: 'member'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Failed to add member:', insertError);
      return new Response(
        JSON.stringify({ success: false, message: 'فشل الانضمام إلى المساحة المشتركة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log("User successfully added as member, member ID:", insertData.id);
    
    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        space_id: invitationData.space_id,
        space_name: spaceData.name,
        member_id: insertData.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'خطأ في معالجة الطلب', error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
