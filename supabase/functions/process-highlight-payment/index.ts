import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HighlightRequest {
  userId: string;
  productId: string;
  days: number;
  paymentMethod: "mpesa" | "emola";
  phoneNumber: string;
}

const HIGHLIGHT_PRICE_PER_DAY = 197;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, productId, days, paymentMethod, phoneNumber }: HighlightRequest = await req.json();

    console.log("Processing highlight payment:", { userId, productId, days, paymentMethod });

    // Validate phone number
    const validMpesa = /^8[45]/.test(phoneNumber);
    const validEmola = /^8[67]/.test(phoneNumber);

    if (
      (paymentMethod === "mpesa" && !validMpesa) ||
      (paymentMethod === "emola" && !validEmola)
    ) {
      return new Response(
        JSON.stringify({ error: "Número de telefone inválido para o método selecionado" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const amount = days * HIGHLIGHT_PRICE_PER_DAY;

    // Get OAuth token
    const clientId = Deno.env.get("E2PAYMENTS_CLIENT_ID");
    const clientSecret = Deno.env.get("E2PAYMENTS_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "Configuração de pagamento não encontrada" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const tokenResp = await fetch("https://e2payments.explicador.co.mz/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResp.json();
    const token = tokenData.access_token;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Falha na autenticação do pagamento" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const endpoint =
      paymentMethod === "mpesa"
        ? "https://e2payments.explicador.co.mz/v1/c2b/mpesa-payment/999813"
        : "https://e2payments.explicador.co.mz/v1/c2b/emola-payment/999814";

    // Reference: e2Payments adds "e2P" prefix + 4 char suffix
    // So our part must be max 8 chars to stay under M-Pesa limit
    const shortProductId = productId.slice(0, 4).replace(/-/g, "");
    const reference = `HL${days}${shortProductId}`;

    console.log("Highlight reference:", reference, "Length:", reference.length);

    const paymentResp = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: new URLSearchParams({
        client_id: clientId,
        amount: amount.toString(),
        reference: reference,
        phone: phoneNumber,
      }),
    });

    const paymentResult = await paymentResp.json();
    console.log("Payment response:", JSON.stringify(paymentResult, null, 2));

    if (paymentResult.success && paymentResult.success.includes("sucesso")) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const highlightExpiresAt = new Date();
      highlightExpiresAt.setDate(highlightExpiresAt.getDate() + days);

      const { error: updateError } = await supabase
        .from("products")
        .update({
          is_highlighted: true,
          highlight_expires_at: highlightExpiresAt.toISOString(),
        })
        .eq("id", productId)
        .eq("seller_id", userId);

      if (updateError) {
        console.error("Failed to update highlight:", updateError);
        return new Response(
          JSON.stringify({ 
            error: "Pagamento recebido mas falhou ao destacar produto. Entre em contato com o suporte." 
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Produto destacado por ${days} dias!`,
          expiresAt: highlightExpiresAt.toISOString(),
          amount,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Pagamento não concluído." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error) {
    console.error("Error processing highlight payment:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar pagamento." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
