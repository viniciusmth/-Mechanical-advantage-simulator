import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (req) => {
  try {
    const url = new URL(req.url);
    // O Mercado Pago envia o ID do pagamento pela URL nos webhooks
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (topic === "payment" && id) {
      // 1. Pergunta ao MP os detalhes reais desse pagamento (segurança contra fraudes)
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { "Authorization": `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}` }
      });
      const paymentInfo = await mpResponse.json();

      // 2. Verifica se o pagamento foi realmente aprovado
      if (paymentInfo.status === "approved") {
        const userId = paymentInfo.metadata.supabase_user_id;

        if (userId) {
          // 3. Conecta ao Supabase com privilégios de Admin
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );

          // 4. Atualiza o banco, liberando o acesso!
          await supabase
            .from('profiles')
            .update({ is_active: true })
            .eq('id', userId);
        }
      }
    }
    // Sempre retorne 200 pro MP saber que você recebeu
    return new Response("OK", { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})