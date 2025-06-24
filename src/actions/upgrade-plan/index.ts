"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { clinicsTable, plansTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upgradePlanSchema } from "./schema";

export const upgradePlan = actionClient
  .schema(upgradePlanSchema)
  .action(async ({ parsedInput: data }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (!session.user.clinic || !session.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar o plano selecionado
    const selectedPlan = await db.query.plansTable.findFirst({
      where: eq(plansTable.slug, data.planSlug),
    });

    if (!selectedPlan) {
      throw new Error("Plano não encontrado");
    }

    // Buscar a clínica atual
    const clinic = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, session.user.clinic.id),
      with: {
        currentPlan: true,
      },
    });

    if (!clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Verificar se não é o mesmo plano atual
    if (clinic.currentPlan?.slug === data.planSlug) {
      throw new Error("Este plano já está ativo");
    }

    // Se a clínica não tem plano atual, definir Essential como padrão
    if (!clinic.currentPlan && data.planSlug === "essential") {
      throw new Error("Este plano já está ativo");
    }

    // TODO: Implementar integração com Stripe aqui
    // Por enquanto, apenas atualizamos o plano no banco de dados

    try {
      await db
        .update(clinicsTable)
        .set({
          currentPlanId: selectedPlan.id,
          planStatus: "active",
          planStartDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(clinicsTable.id, session.user.clinic.id));

      revalidatePath("/plans");

      return {
        success: true,
        message: `Plano atualizado para ${selectedPlan.name} com sucesso!`,
      };
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      throw new Error("Erro interno do servidor");
    }
  });
