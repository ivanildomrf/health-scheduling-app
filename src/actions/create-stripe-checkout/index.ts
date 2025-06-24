"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";
import { z } from "zod";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

const createStripeCheckoutSchema = z.object({
  stripePriceId: z.string(),
});

export const createStripeCheckout = actionClient
  .schema(createStripeCheckoutSchema)
  .action(async ({ parsedInput: { stripePriceId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (!session.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Configuração do Stripe não encontrada");
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error("URL da aplicação não configurada");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Buscar a clínica para verificar se já tem customer
    const clinic = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, session.user.clinic.id),
    });

    if (!clinic) {
      throw new Error("Clínica não encontrada");
    }

    let customerId = clinic.stripeCustomerId;

    // Se não tem customer, criar um novo
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: clinic.name,
        metadata: {
          clinicId: clinic.id,
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      // Salvar o customer ID no banco
      await db
        .update(clinicsTable)
        .set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(clinicsTable.id, clinic.id));
    }

    // Criar sessão de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        clinicId: clinic.id,
        userId: session.user.id,
      },
      subscription_data: {
        metadata: {
          clinicId: clinic.id,
          userId: session.user.id,
        },
      },
    });

    return {
      sessionId: checkoutSession.id,
    };
  });
