import { getPatientSession } from "@/helpers/patient-session";
import { redirect } from "next/navigation";
import { PatientDashboardOverview } from "./components/patient-dashboard-overview";
import { PatientQuickActions } from "./components/patient-quick-actions";
import { PatientUpcomingAppointments } from "./components/patient-upcoming-appointments";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/patient/login");
  }

  return (
    <div className="space-y-6">
      {/* Header de boas-vindas */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo(a), {session.patient.name.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-gray-600">
              Gerencie seus agendamentos e informações pessoais
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Clínica</p>
            <p className="font-semibold text-gray-900">
              {session.patient.clinic.name}
            </p>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <PatientDashboardOverview patientId={session.patient.id} />
          <PatientUpcomingAppointments patientId={session.patient.id} />
        </div>

        {/* Sidebar direita */}
        <div className="space-y-6">
          <PatientQuickActions />
        </div>
      </div>
    </div>
  );
}
