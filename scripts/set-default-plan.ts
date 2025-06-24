import { eq, isNull } from "drizzle-orm";
import { db } from "../src/db/index";
import { clinicsTable, plansTable } from "../src/db/schema";

async function setDefaultPlan() {
  try {
    console.log("🔧 Definindo plano padrão para clínicas...");

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

    console.log(
      `📋 Encontradas ${clinicsWithoutPlan.length} clínicas sem plano definido`,
    );

    if (clinicsWithoutPlan.length === 0) {
      console.log("✅ Todas as clínicas já têm plano definido!");
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

      console.log(`✅ Plano Essential definido para clínica: ${clinic.name}`);
    }

    console.log("🎉 Processo concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante o processo:", error);
    throw error;
  }
}

// Executar o script
setDefaultPlan()
  .then(() => {
    console.log("🏁 Processo finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Falha no processo:", error);
    process.exit(1);
  });
