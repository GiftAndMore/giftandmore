import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        const { conversation_id, reason } = await req.json()

        // 1. Update conversation status
        const { error: updateError } = await supabaseClient
            .from('conversations')
            .update({
                status: 'escalated_waiting',
                escalated_at: new Date().toISOString()
            })
            .eq('id', conversation_id)

        if (updateError) throw updateError

        // 2. Insert System Message
        await supabaseClient.from('messages').insert({
            conversation_id,
            sender_type: 'system',
            content: 'Requesting live agent support...'
        })

        // 3. Find target tokens (Admins + Online Assistants)
        const { data: targets } = await supabaseClient
            .from('profiles')
            .select('id')
            .or('role.eq.admin,and(role.eq.assistant,status.eq.online)')

        if (targets && targets.length > 0) {
            const userIds = targets.map(t => t.id)
            const { data: tokens } = await supabaseClient
                .from('push_tokens')
                .select('token')
                .in('user_id', userIds)

            // 4. Send Push (Pseudo-code for generic provider)
            // await sendPushNotifications(tokens, "New Support Request", "A user needs help!")
            console.log(`Notifying ${tokens?.length} devices`)
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
