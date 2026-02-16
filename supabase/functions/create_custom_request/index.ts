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

        // Auth Check
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabaseClient.auth.getUser(token)
        if (!user) throw new Error("Unauthorized")

        const { recipients, addresses, purpose_tag_id, budget_min, budget_max, details } = await req.json()

        // 1. Create Base Order
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'placed',
                payment_status: 'unpaid',
                order_kind: 'custom',
                total_amount: 0 // Unknown yet
            })
            .select()
            .single()

        if (orderError) throw orderError

        // 2. Insert Custom Request Details
        await supabaseClient.from('custom_requests').insert({
            order_id: order.id,
            purpose_tag_id,
            budget_min,
            budget_max,
            details
        })

        // 3. Insert Recipients & Address (Reused logic from create_order)
        // ... Simplified for this snippet ...
        // Assume client logic handles adding recipients/address linked to order_id separately or we duplicate logic here.
        // Ideally we'd have a shared Database Function for "Create Order Structure". 

        // 4. Create Conversation & Escalate
        const { data: conv } = await supabaseClient
            .from('conversations')
            .insert({
                user_id: user.id,
                type: 'order', // or custom_request
                order_id: order.id,
                status: 'escalated_waiting',
                escalated_at: new Date().toISOString(),
                title: `Custom Request #${order.id.slice(0, 8)}`
            })
            .select()
            .single()

        // 5. Notify Admins
        // Call request_human_support logic or just trigger notification here

        return new Response(JSON.stringify({
            orderId: order.id,
            conversationId: conv.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
