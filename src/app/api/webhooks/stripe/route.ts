import { db } from "@/db";
import { clinicsTable, plansTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Assinatura do webhook não encontrada" },
        { status: 400 },
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Secret do webhook não configurado" },
        { status: 500 },
      );
    }

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
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_succeeded":
        console.log("Pagamento bem-sucedido processado");
        break;

      case "invoice.payment_failed":
        console.log("Falha no pagamento processada");
        break;

      default:
        console.log(`Evento não processado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook do Stripe:", error);
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
    case "cancelled":
      planStatus = "cancelled";
      break;
    case "past_due":
    case "unpaid":
      planStatus = "expired";
      break;
    default:
      planStatus = "trial";
  }

  // Calcular datas da assinatura
  const planStartDate = new Date(subscription.current_period_start * 1000);
  const planEndDate = new Date(subscription.current_period_end * 1000);

  console.log("📅 Datas da assinatura:");
  console.log("- Início:", planStartDate.toISOString());
  console.log("- Fim:", planEndDate.toISOString());
  console.log("- Status:", planStatus);

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
