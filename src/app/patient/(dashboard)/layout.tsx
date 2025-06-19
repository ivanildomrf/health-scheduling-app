import { getPatientSession } from "@/helpers/patient-session";
import { redirect } from "next/navigation";
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

  // Se não há sessão, redirecionar para login
  if (!session) {
    redirect("/patient/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PatientHeader session={session} />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
