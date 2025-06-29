import { eq, isNull } from "drizzle-orm";

import { db } from "../src/db/index";
import { clinicsTable, plansTable } from "../src/db/schema";

async function setDefaultPlan() {
  try {
    // Buscar o plano Essential
    const essentialPlan = await db.query.plansTable.findFirst({
      where: eq(plansTable.slug, "essential"),
    });

    if (!essentialPlan) {
      console.error("❌ Plano Essential não encontrado!");
      return;
    }

    // Buscar clínicas sem plano definido
    const clinicsWithoutPlan = await db.query.clinicsTable.findMany({
      where: isNull(clinicsTable.currentPlanId),
    });

    if (clinicsWithoutPlan.length === 0) {
      return;
    }

    // Atualizar clínicas para usar o plano Essential
    for (const clinic of clinicsWithoutPlan) {
      await db
        .update(clinicsTable)
        .set({
          currentPlanId: essentialPlan.id,
          planStatus: "trial",
          planStartDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(clinicsTable.id, clinic.id));
    }
  } catch {
    throw new Error("Erro ao definir plano padrão");
  }
}

// Executar o script
setDefaultPlan()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
