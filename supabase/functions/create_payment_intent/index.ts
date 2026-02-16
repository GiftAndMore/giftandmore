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
        const { order_id, amount, currency = 'USD', provider = 'mock' } = await req.json()

        // 1. Create Payment Record (Pending)
        const { data: payment, error } = await supabaseClient
            .from('payments')
            .insert({
                order_id,
                provider,
                amount,
                currency,
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        // 2. Call Provider API (Stripe/Paystack etc)
        // MOCK RESPONSE for now
        const clientSecret = `mock_secret_${payment.id}`

        // 3. Update Order Payment Status
        await supabaseClient
            .from('orders')
            .update({ payment_status: 'pending' })
            .eq('id', order_id)

        return new Response(JSON.stringify({
            clientSecret,
            paymentId: payment.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
