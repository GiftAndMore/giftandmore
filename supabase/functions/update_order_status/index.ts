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
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use Service Role to bypass RLS for checks if needed
        )

        const { order_id, new_status, note } = await req.json()

        // Auth Check
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabaseClient.auth.getUser(token)

        if (!user) throw new Error("Unauthorized")

        // Fetch user role
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role ?? 'user'

        // Permission Logic
        if (role === 'user') throw new Error("Users cannot change status directly")
        if (role === 'assistant') {
            // Check if allowed transition (e.g. only to 'confirmed' or 'processing')
            // Assistants cannot mark shipped/delivered/cancelled
            const allowed = ['confirmed', 'processing'];
            if (!allowed.includes(new_status)) {
                throw new Error(`Assistant not authorized for status: ${new_status}`);
            }
            // Check assignment (if you have assignment logic)
        }

        // Update Order
        const { error: updateError } = await supabaseClient
            .from('orders')
            .update({ status: new_status })
            .eq('id', order_id)

        if (updateError) throw updateError

        // Insert Event
        await supabaseClient.from('order_status_events').insert({
            order_id,
            status: new_status,
            note,
            created_by: user.id
        })

        // TODO: Send Push Notification to Sender

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
