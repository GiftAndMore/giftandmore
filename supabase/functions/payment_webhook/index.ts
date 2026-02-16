import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Parse Webhook Payload (Provider specific)
        const payload = await req.json()
        // Assume payload contains { paymentId, status: 'succeeded' } for Mock

        if (payload.status === 'succeeded') {
            const paymentId = payload.paymentId

            // 1. Update Payment
            const { data: payment } = await supabaseClient
                .from('payments')
                .update({ status: 'succeeded' })
                .eq('id', paymentId)
                .select()
                .single()

            if (payment) {
                // 2. Update Order
                await supabaseClient
                    .from('orders')
                    .update({
                        payment_status: 'paid',
                        paid_at: new Date().toISOString(),
                        status: 'confirmed' // Auto-confirm on payment? Or keep placed? User logic choice.
                    })
                    .eq('id', payment.order_id)

                // 3. Notify User (Push)
                // await notifyUser(payment.order_id, "Payment Successful")
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
