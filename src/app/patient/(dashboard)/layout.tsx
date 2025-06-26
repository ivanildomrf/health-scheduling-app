import { getPatientSession } from "@/helpers/patient-session";

import { PatientHeader } from "../components/patient-header";
import { PatientSidebar } from "../components/patient-sidebar";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPatientSession();

  // TEMPORÁRIO: Para debugging, vamos usar dados mock se não houver sessão
  const mockSession = session || {
    id: "mock-session-id",
    patientId: "mock-patient-id",
    token: "mock-token",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    patient: {
      id: "mock-patient-id",
      name: "Paciente Mock",
      email: "mock@test.com",
      phone: "(11) 99999-9999",
      cpf: null,
      birthDate: new Date("1990-01-01"),
      sex: "male" as const,
      clinic: {
        id: "mock-clinic-id",
        name: "Clínica Mock",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PatientHeader session={mockSession} />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
