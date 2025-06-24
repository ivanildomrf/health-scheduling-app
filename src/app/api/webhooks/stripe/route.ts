import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { clinicsTable, plansTable } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    console.log("🔗 Webhook do Stripe recebido");

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Assinatura do webhook não encontrada");
      return NextResponse.json(
        { error: "Assinatura do webhook não encontrada" },
        { status: 400 },
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET não configurado");
      return NextResponse.json(
        { error: "Secret do webhook não configurado" },
        { status: 500 },
      );
    }

    console.log("🔐 Verificando assinatura do webhook...");

    // Verificar a assinatura do webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log("📨 Evento do Stripe recebido:", event.type);
    console.log("🆔 Event ID:", event.id);

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "checkout.session.completed":
        console.log("🛒 Processando checkout.session.completed");
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        console.log("📋 Processando mudança de assinatura");
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        console.log("❌ Processando cancelamento de assinatura");
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_succeeded":
        console.log("✅ Pagamento bem-sucedido processado");
        break;

      case "invoice.payment_failed":
        console.log("❌ Falha no pagamento processada");
        break;

      default:
        console.log(`ℹ️ Evento não processado: ${event.type}`);
    }

    console.log("✅ Webhook processado com sucesso");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("💥 Erro no webhook do Stripe:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Mensagem do erro:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("🛒 Checkout completado:", session.id);
  console.log("Mode:", session.mode);
  console.log("Payment status:", session.payment_status);

  const clinicId = session.metadata?.clinicId;

  if (!clinicId) {
    console.error("❌ Clinic ID não encontrado nos metadados da sessão");
    console.log("Metadados disponíveis:", session.metadata);
    return;
  }

  console.log("✅ Checkout completado para clínica:", clinicId);

  // Se for subscription, aguardar o evento subscription.created/updated
  if (session.mode === "subscription") {
    console.log("📋 Modo subscription - aguardando evento de assinatura");
    return;
  }

  // Para outros modos de pagamento, processar aqui se necessário
  console.log("ℹ️ Checkout processado com sucesso");
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log("🔄 Processando mudança de assinatura:", subscription.id);
  console.log("Status da assinatura:", subscription.status);

  const clinicId = subscription.metadata?.clinicId;

  if (!clinicId) {
    console.error("❌ Clinic ID não encontrado nos metadados da assinatura");
    console.log("Metadados disponíveis:", subscription.metadata);
    return;
  }

  console.log("✅ Clinic ID encontrado:", clinicId);

  // Buscar o plano pelo price ID
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.error("❌ Price ID não encontrado na assinatura");
    return;
  }

  console.log("✅ Price ID encontrado:", priceId);

  const plan = await db.query.plansTable.findFirst({
    where: eq(plansTable.stripePriceId, priceId),
  });

  if (!plan) {
    console.error(`❌ Plano não encontrado para price ID: ${priceId}`);
    return;
  }

  console.log("✅ Plano encontrado:", plan.name, `(${plan.slug})`);

  // Mapear status do Stripe para nosso enum
  let planStatus: "active" | "cancelled" | "expired" | "trial";
  switch (subscription.status) {
    case "active":
      planStatus = "active";
      break;
    case "canceled":
      planStatus = "cancelled";
      break;
    case "past_due":
    case "unpaid":
      planStatus = "expired";
      break;
    default:
      planStatus = "trial";
  }

  // Calcular datas da assinatura com verificação de segurança
  let planStartDate: Date | null = null;
  let planEndDate: Date | null = null;

  try {
    // As datas estão dentro dos items da subscription, não na raiz
    const subscriptionItem = subscription.items.data[0];

    if (subscriptionItem?.current_period_start) {
      planStartDate = new Date(subscriptionItem.current_period_start * 1000);
    }
    if (subscriptionItem?.current_period_end) {
      planEndDate = new Date(subscriptionItem.current_period_end * 1000);
    }

    console.log("📅 Datas da assinatura:");
    console.log(
      "- current_period_start (item):",
      subscriptionItem?.current_period_start,
    );
    console.log(
      "- current_period_end (item):",
      subscriptionItem?.current_period_end,
    );
    console.log("- Início:", planStartDate?.toISOString() || "Não definido");
    console.log("- Fim:", planEndDate?.toISOString() || "Não definido");
    console.log("- Status:", planStatus);
  } catch (error) {
    console.error("❌ Erro ao processar datas da assinatura:", error);
    // Usar datas padrão se houver erro
    planStartDate = new Date();
    planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias a partir de agora
    console.log("⚠️ Usando datas padrão devido ao erro");
  }

  // Atualizar a clínica com os dados da assinatura
  const result = await db
    .update(clinicsTable)
    .set({
      currentPlanId: plan.id,
      stripeSubscriptionId: subscription.id,
      planStatus,
      planStartDate,
      planEndDate,
      updatedAt: new Date(),
    })
    .where(eq(clinicsTable.id, clinicId))
    .returning();

  console.log("✅ Clínica atualizada com sucesso:");
  console.log(`- Clínica: ${clinicId}`);
  console.log(`- Plano: ${plan.name}`);
  console.log(`- Status: ${planStatus}`);
  console.log(`- Subscription ID: ${subscription.id}`);

  if (result.length === 0) {
    console.error("⚠️ Nenhuma linha foi atualizada - clínica não encontrada?");
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const clinicId = subscription.metadata?.clinicId;

  if (!clinicId) {
    console.error("Clinic ID não encontrado nos metadados da assinatura");
    return;
  }

  // Buscar o plano Essential para downgrade
  const essentialPlan = await db.query.plansTable.findFirst({
    where: eq(plansTable.slug, "essential"),
  });

  if (!essentialPlan) {
    console.error("Plano Essential não encontrado");
    return;
  }

  // Fazer downgrade para Essential
  await db
    .update(clinicsTable)
    .set({
      currentPlanId: essentialPlan.id,
      stripeSubscriptionId: null,
      planStatus: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(clinicsTable.id, clinicId));

  console.log(
    `Assinatura cancelada para clínica ${clinicId}, downgrade para Essential`,
  );
}
