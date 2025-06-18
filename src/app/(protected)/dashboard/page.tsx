import { getDashboardAnalytics } from "@/actions/get-dashboard-analytics";
import { PageContainer } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AnalyticsChart } from "./components/analytics-chart";
import { RecentAppointments } from "./components/recent-appointments";
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
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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

        {/* Grid Layout para o resto do conteúdo */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Gráfico principal - ocupa 2 colunas */}
          <div className="h-96 lg:col-span-2">
            <AnalyticsChart data={analytics.monthlyData} />
          </div>

          {/* Profissionais Top - altura fixa para alinhamento */}
          <div className="h-96 lg:col-span-1">
            <TopProfessionals professionals={analytics.topProfessionals} />
          </div>

          {/* Agendamentos Recentes */}
          <div className="lg:col-span-2">
            <RecentAppointments appointments={analytics.recentAppointments} />
          </div>

          {/* Estatísticas por Especialidade */}
          <div className="lg:col-span-1">
            <SpecialityStats specialities={analytics.specialityStats} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
