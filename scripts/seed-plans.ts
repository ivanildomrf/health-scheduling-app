import { db } from "../src/db/index";
import {
  planFeatureLimitsTable,
  planFeaturesTable,
  plansTable,
} from "../src/db/schema";

async function seedPlans() {
  try {
    console.log("🌱 Iniciando seed dos planos...");

    // Verificar se já existem planos
    const existingPlans = await db.select().from(plansTable);
    if (existingPlans.length > 0) {
      console.log("⚠️  Planos já existem no banco de dados. Pulando seed...");
      return;
    }

    // Inserir os planos disponíveis
    console.log("📋 Inserindo planos...");
    const plans = await db
      .insert(plansTable)
      .values([
        {
          name: "Essential",
          slug: "essential",
          description: "Para profissionais autônomos ou pequenas clínicas",
          priceInCents: 5900,
          sortOrder: 1,
        },
        {
          name: "Professional",
          slug: "professional",
          description: "Para clínicas médias com múltiplos profissionais",
          priceInCents: 11900,
          sortOrder: 2,
        },
        {
          name: "Enterprise",
          slug: "enterprise",
          description: "Para grandes clínicas e hospitais",
          priceInCents: 29900,
          sortOrder: 3,
        },
      ])
      .returning();

    console.log(`✅ ${plans.length} planos criados com sucesso!`);

    // Inserir as funcionalidades do sistema
    console.log("🔧 Inserindo funcionalidades...");
    const features = await db
      .insert(planFeaturesTable)
      .values([
        // Limites de cadastro
        {
          name: "max_professionals",
          displayName: "Cadastro de profissionais",
          description:
            "Número máximo de profissionais que podem ser cadastrados",
          featureType: "limit",
          category: "limits",
          sortOrder: 1,
        },

        // Funcionalidades básicas
        {
          name: "unlimited_appointments",
          displayName: "Agendamentos ilimitados",
          description: "Permite agendamentos sem limite de quantidade",
          featureType: "boolean",
          category: "features",
          sortOrder: 2,
        },
        {
          name: "patient_management",
          displayName: "Cadastro de pacientes",
          description: "Permite cadastro e gerenciamento de pacientes",
          featureType: "boolean",
          category: "features",
          sortOrder: 3,
        },

        // Métricas e relatórios
        {
          name: "basic_metrics",
          displayName: "Métricas básicas",
          description: "Dashboard com métricas básicas de agendamentos",
          featureType: "boolean",
          category: "analytics",
          sortOrder: 4,
        },
        {
          name: "advanced_metrics",
          displayName: "Métricas avançadas",
          description: "Relatórios detalhados e métricas avançadas",
          featureType: "boolean",
          category: "analytics",
          sortOrder: 5,
        },
        {
          name: "complete_metrics",
          displayName: "Métricas completas",
          description: "Suite completa de análises e relatórios personalizados",
          featureType: "boolean",
          category: "analytics",
          sortOrder: 6,
        },

        // Confirmações
        {
          name: "manual_confirmation",
          displayName: "Confirmação manual",
          description: "Confirmação manual de agendamentos",
          featureType: "boolean",
          category: "features",
          sortOrder: 7,
        },
        {
          name: "automatic_confirmation",
          displayName: "Confirmação automática",
          description: "Confirmação automática de agendamentos",
          featureType: "boolean",
          category: "features",
          sortOrder: 8,
        },

        // Suporte
        {
          name: "email_support",
          displayName: "Suporte via e-mail",
          description: "Suporte via e-mail durante horário comercial",
          featureType: "boolean",
          category: "support",
          sortOrder: 9,
        },
        {
          name: "chat_support",
          displayName: "Suporte via chat",
          description: "Suporte via chat em tempo real",
          featureType: "boolean",
          category: "support",
          sortOrder: 10,
        },
        {
          name: "priority_support",
          displayName: "Suporte prioritário 24/7",
          description: "Suporte prioritário disponível 24 horas por dia",
          featureType: "boolean",
          category: "support",
          sortOrder: 11,
        },

        // Integrações e recursos avançados
        {
          name: "detailed_reports",
          displayName: "Relatórios detalhados",
          description: "Relatórios detalhados de pacientes e agendamentos",
          featureType: "boolean",
          category: "features",
          sortOrder: 12,
        },
        {
          name: "calendar_integration",
          displayName: "Integração com calendário",
          description: "Sincronização com Google Calendar e outros",
          featureType: "boolean",
          category: "integrations",
          sortOrder: 13,
        },
        {
          name: "custom_reports",
          displayName: "Relatórios personalizados",
          description: "Criação de relatórios personalizados",
          featureType: "boolean",
          category: "features",
          sortOrder: 14,
        },
        {
          name: "api_access",
          displayName: "API completa",
          description: "Acesso completo à API para integrações customizadas",
          featureType: "boolean",
          category: "integrations",
          sortOrder: 15,
        },
        {
          name: "automatic_backup",
          displayName: "Backup automático",
          description: "Backup automático dos dados da clínica",
          featureType: "boolean",
          category: "features",
          sortOrder: 16,
        },
        {
          name: "multiple_locations",
          displayName: "Múltiplas localizações",
          description: "Suporte para clínicas com múltiplas filiais",
          featureType: "boolean",
          category: "features",
          sortOrder: 17,
        },
      ])
      .returning();

    console.log(`✅ ${features.length} funcionalidades criadas com sucesso!`);

    // Configurar funcionalidades para cada plano
    console.log("🔗 Configurando funcionalidades dos planos...");

    // Configurar plano Essential
    const essentialPlan = plans.find((p) => p.slug === "essential");
    const professionalPlan = plans.find((p) => p.slug === "professional");
    const enterprisePlan = plans.find((p) => p.slug === "enterprise");

    const essentialFeatures = features.filter((f) =>
      [
        "max_professionals",
        "unlimited_appointments",
        "patient_management",
        "basic_metrics",
        "manual_confirmation",
        "email_support",
      ].includes(f.name),
    );

    const professionalFeatures = features.filter((f) =>
      [
        "max_professionals",
        "unlimited_appointments",
        "patient_management",
        "basic_metrics",
        "advanced_metrics",
        "automatic_confirmation",
        "email_support",
        "chat_support",
        "detailed_reports",
        "calendar_integration",
      ].includes(f.name),
    );

    // Essential plan limits
    for (const feature of essentialFeatures) {
      await db.insert(planFeatureLimitsTable).values({
        planId: essentialPlan!.id,
        featureId: feature.id,
        enabled: true,
        limitValue: feature.name === "max_professionals" ? 3 : null,
      });
    }

    // Professional plan limits
    for (const feature of professionalFeatures) {
      await db.insert(planFeatureLimitsTable).values({
        planId: professionalPlan!.id,
        featureId: feature.id,
        enabled: true,
        limitValue: feature.name === "max_professionals" ? 10 : null,
      });
    }

    // Enterprise plan - todas as funcionalidades
    for (const feature of features) {
      await db.insert(planFeatureLimitsTable).values({
        planId: enterprisePlan!.id,
        featureId: feature.id,
        enabled: true,
        limitValue: feature.name === "max_professionals" ? null : null, // null = ilimitado
      });
    }

    console.log("✅ Funcionalidades dos planos configuradas com sucesso!");
    console.log("🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

// Executar o seed
seedPlans()
  .then(() => {
    console.log("🏁 Processo finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Falha no seed:", error);
    process.exit(1);
  });
