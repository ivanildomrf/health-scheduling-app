import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDashboardAnalytics } from "@/actions/get-dashboard-analytics";
import { PageContainer } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { AnalyticsChart } from "./components/analytics-chart";
import { RecentAppointments } from "./components/recent-appointments";
import { RevenueChart } from "./components/revenue-chart";
import { SpecialityStats } from "./components/speciality-stats";
import { StatsCards } from "./components/stats-cards";
import { TopProfessionals } from "./components/top-professionals";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic || !session.user.clinic?.id) {
    redirect("/clinic-form");
  }

  // Buscar dados de analytics
  const result = await getDashboardAnalytics({
    clinicId: session.user.clinic.id,
  });

  if (!result?.data) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        </div>
      </PageContainer>
    );
  }

  const analytics = result.data;

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-gray-600">
            Acesse uma visão detalhada das principais métricas e resultados da
            sua clínica
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <StatsCards
          revenue={analytics.revenue}
          totalAppointments={analytics.totalAppointments}
          totalPatients={analytics.totalPatients}
          totalProfessionals={analytics.totalProfessionals}
        />

        {/* Grid de gráficos principais */}
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Gráfico de Agendamentos e Faturamento - ocupa 2 colunas */}
          <div className="h-full lg:col-span-1">
            <RevenueChart
              dailyAppointmentsData={analytics.dailyAppointmentsData.map(
                (item) => ({
                  date: item.date,
                  appointments: item.appointments,
                  revenue: Number(item.revenue) || 0,
                }),
              )}
            />
          </div>

          {/* Gráfico de Evolução Mensal */}
          <div className="h-full">
            <AnalyticsChart data={analytics.monthlyData} />
          </div>
        </div>

        {/* Grid Layout para o resto do conteúdo */}
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Agendamentos Recentes - ocupa 2 colunas */}
          <div className="h-full lg:col-span-1">
            <RecentAppointments appointments={analytics.recentAppointments} />
          </div>

          {/* Coluna direita com Médicos e Especialidades */}
          <div className="flex h-full gap-4 lg:col-span-1">
            {/* Profissionais Top */}
            <div className="min-h-0 flex-1">
              <TopProfessionals professionals={analytics.topProfessionals} />
            </div>

            {/* Estatísticas por Especialidade */}
            <div className="min-h-0 flex-1">
              <SpecialityStats specialities={analytics.specialityStats} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
