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
        const { conversation_id } = await req.json()

        // 1. Find an available assistant (status='online')
        const { data: assistant } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('role', 'assistant')
            .eq('status', 'online')
            .limit(1)
            .single()

        if (!assistant) {
            return new Response(JSON.stringify({ error: "No assistants online" }), { status: 404 })
        }

        // 2. Add assistant to conversation_participants
        await supabaseClient
            .from('conversation_participants')
            .insert({ conversation_id, user_id: assistant.id })

        // 3. Notify assistant (Push notification or system message)

        return new Response(JSON.stringify({ assistant_id: assistant.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
