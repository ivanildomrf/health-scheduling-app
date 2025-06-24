import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { clinicsTable, planFeatureLimitsTable, plansTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";
import { Check } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PlanCard from "./_components/plan-card";

const PlansPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic || !session.user.clinic?.id) {
    redirect("/clinic-form");
  }

  // Buscar planos com suas funcionalidades
  const plans = await db.query.plansTable.findMany({
    where: eq(plansTable.isActive, true),
    orderBy: [asc(plansTable.sortOrder)],
    with: {
      planFeatureLimits: {
        where: eq(planFeatureLimitsTable.enabled, true),
        with: {
          feature: true,
        },
      },
    },
  });

  // Buscar plano atual da clínica
  const clinic = await db.query.clinicsTable.findFirst({
    where: eq(clinicsTable.id, session.user.clinic.id),
    with: {
      currentPlan: true,
    },
  });

  // Transformar dados para o formato esperado pelo componente
  const transformedPlans = plans.map((plan) => ({
    id: plan.slug,
    name: plan.name,
    price: plan.priceInCents / 100,
    description: plan.description,
    features: plan.planFeatureLimits
      .sort((a, b) => (a.feature.sortOrder || 0) - (b.feature.sortOrder || 0))
      .map((limit) => {
        const feature = limit.feature;
        if (feature.featureType === "limit" && limit.limitValue) {
          return `${feature.displayName} (até ${limit.limitValue})`;
        } else if (feature.featureType === "limit" && !limit.limitValue) {
          return `${feature.displayName} (ilimitado)`;
        }
        return feature.displayName;
      }),
    isCurrentPlan:
      clinic?.currentPlan?.slug === plan.slug ||
      (!clinic?.currentPlan && plan.slug === "essential"),
    stripePriceId: plan.stripePriceId,
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderDescription>
            Escolha o plano que melhor se adequa às necessidades da sua clínica.
            Faça upgrade a qualquer momento para desbloquear recursos
            adicionais.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {transformedPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Seção de benefícios */}
        <div className="mt-16 text-center">
          <h2 className="mb-8 text-2xl font-semibold text-gray-900">
            Por que escolher nossos planos?
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Sem Compromisso
              </h3>
              <p className="text-sm text-gray-600">
                Cancele ou mude de plano a qualquer momento sem taxas adicionais
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Suporte Completo
              </h3>
              <p className="text-sm text-gray-600">
                Equipe especializada pronta para ajudar no que você precisar
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Atualizações Grátis
              </h3>
              <p className="text-sm text-gray-600">
                Receba novos recursos e melhorias automaticamente
              </p>
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default PlansPage;
