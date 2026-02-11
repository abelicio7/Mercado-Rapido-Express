import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  userId: string;
  planType: "basico" | "pro";
  billingPeriod: "mensal" | "anual";
  paymentMethod: "mpesa" | "emola";
  phoneNumber: string;
  customerName: string;
  customerEmail: string;
}

const PLAN_PRICES = {
  basico: { mensal: 497, anual: 2997 },
  pro: { mensal: 997, anual: 5999 },
};

const PLAN_PRODUCT_LIMITS = {
  basico: 15,
  pro: 30,
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userId,
      planType,
      billingPeriod,
      paymentMethod,
      phoneNumber,
      customerName,
      customerEmail,
    }: PaymentRequest = await req.json();

    console.log("Processing subscription payment:", {
      userId,
      planType,
      billingPeriod,
      paymentMethod,
      phoneNumber,
    });

    // Validate phone number format
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

    const amount = PLAN_PRICES[planType][billingPeriod];

    // Get OAuth token
    const clientId = Deno.env.get("E2PAYMENTS_CLIENT_ID");
    const clientSecret = Deno.env.get("E2PAYMENTS_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      console.error("Missing payment credentials");
      return new Response(
        JSON.stringify({ error: "Configuração de pagamento não encontrada" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Getting OAuth token...");
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
      console.error("Failed to get access token:", tokenData);
      return new Response(
        JSON.stringify({ error: "Falha na autenticação do pagamento" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Token obtained, processing payment...");

    // Process payment based on method
    const endpoint =
      paymentMethod === "mpesa"
        ? "https://e2payments.explicador.co.mz/v1/c2b/mpesa-payment/999813"
        : "https://e2payments.explicador.co.mz/v1/c2b/emola-payment/999814";

    // Reference: e2Payments adds "e2P" prefix + 4 char suffix
    // So our part must be max 8 chars to stay under M-Pesa limit (~20 chars total)
    // Format: BSC1M926 (8 chars) - plan + random digit + period + short id
    const planCode = planType === "basico" ? "B" : "P";
    const periodCode = billingPeriod === "mensal" ? "M" : "A";
    const randomDigit = Math.floor(Math.random() * 10);
    const shortId = userId.slice(0, 4).replace(/-/g, "");
    const reference = `${planCode}${randomDigit}${periodCode}${shortId}`;

    console.log("Payment reference:", reference, "Length:", reference.length);

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
      // Payment successful - update user subscription
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const now = new Date();
      const planExpiresAt = new Date(now);
      
      if (billingPeriod === "mensal") {
        planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);
      } else {
        planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan_type: planType,
          plan_expires_at: planExpiresAt.toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to update subscription:", updateError);
        return new Response(
          JSON.stringify({ 
            error: "Pagamento recebido mas falhou ao atualizar assinatura. Entre em contato com o suporte." 
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Record payment for revenue tracking
      const { error: paymentRecordError } = await supabase
        .from("subscription_payments")
        .insert({
          seller_id: userId,
          plan_type: planType,
          billing_period: billingPeriod,
          amount: amount,
          payment_method: paymentMethod,
          payment_reference: reference,
        });

      if (paymentRecordError) {
        console.error("Failed to record payment (non-critical):", paymentRecordError);
      }

      console.log("Subscription updated successfully!");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Pagamento confirmado! Sua assinatura foi ativada.",
          plan: planType,
          expiresAt: planExpiresAt.toISOString(),
          amount,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      console.log("Payment not successful:", paymentResult);
      return new Response(
        JSON.stringify({ 
          error: "Pagamento não concluído. A transação foi cancelada ou falhou.",
          details: paymentResult 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar pagamento. Tente novamente." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
