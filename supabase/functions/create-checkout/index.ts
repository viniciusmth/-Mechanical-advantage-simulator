// @ts-ignore
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Lida com a requisição preflight (CORS) do navegador
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { user_id, email, name } = await req.json()

    // Chama a API do Mercado Pago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{
          title: "Acesso ao Simulador VM",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 30.00 // O valor da sua cobrança
        }],
        payer: { email: email, name: name },
        metadata: { supabase_user_id: user_id }, // ESSE É O SEGREDO: Carimba quem está comprando
        back_urls: {
          success: "https://mechanical-advantage-simulator.vercel.app", // Altere para seu domínio final
          failure: "https://mechanical-advantage-simulator.vercel.app",
          pending: "https://mechanical-advantage-simulator.vercel.app"
        },
        auto_return: "approved"
      })
    });

    const data = await response.json();
    
    // Retorna a URL de pagamento para o frontend
    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})