import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const {
      order_items,
      recipient, // { name, email, phone, whatsapp }
      address,   // { address_text, lat, lng, notes }
      special_note,
      custom_request
    } = await req.json()

    // 1. Validate inputs (Recipients/Phone required)
    if (!recipient?.email || !recipient?.phone) {
      throw new Error("Recipient email and phone are required")
    }
    if (!address?.address_text) {
      throw new Error("Delivery address is required")
    }

    // 2. Create Order (Transaction mock - real transaction requires RPC or careful ordering)
    // Note: Supabase JS doesn't support transactions directly yet without RPC. 
    // We will do optimistic chaining here or use a Postgres function via RPC for atomicity.
    // For this skeleton, we show the logic flow.

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // A. Insert Order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'placed',
        total_amount: 0, // Calculate from items
        special_note,
        custom_request
      })
      .select()
      .single()

    if (orderError) throw orderError

    // B. Insert Recipient
    await supabaseClient.from('recipients').insert({ ...recipient, order_id: order.id })

    // C. Insert Address
    await supabaseClient.from('order_addresses').insert({ ...address, order_id: order.id })

    // D. Insert Items (and calc total)
    // Loop or bulk insert items...

    // E. Initial Status Event
    await supabaseClient.from('order_status_events').insert({
      order_id: order.id,
      status: 'placed',
      note: 'Order placed successfully',
      created_by: user.id
    })

    return new Response(JSON.stringify({ order }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
