import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { clinicsTable, plansTable } from "@/db/schema";

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
        break;

      case "invoice.payment_failed":
        break;

      default:
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clinicId = session.metadata?.clinicId;

  if (!clinicId) {
    return;
  }

  // Se for subscription, aguardar o evento subscription.created/updated
  if (session.mode === "subscription") {
    return;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const clinicId = subscription.metadata?.clinicId;

  if (!clinicId) {
    return;
  }

  // Buscar o plano pelo price ID
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    return;
  }

  const plan = await db.query.plansTable.findFirst({
    where: eq(plansTable.stripePriceId, priceId),
  });

  if (!plan) {
    return;
  }

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
  } catch {
    planStartDate = new Date();
    planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias a partir de agora
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

  if (result.length === 0) {
    console.error("⚠️ Nenhuma linha foi atualizada - clínica não encontrada?");
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const clinicId = subscription.metadata?.clinicId;

  if (!clinicId) {
    return;
  }

  // Buscar o plano Essential para downgrade
  const essentialPlan = await db.query.plansTable.findFirst({
    where: eq(plansTable.slug, "essential"),
  });

  if (!essentialPlan) {
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
}
