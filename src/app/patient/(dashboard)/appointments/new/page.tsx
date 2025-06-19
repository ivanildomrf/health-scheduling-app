import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PatientNewAppointmentForm } from "./components/patient-new-appointment-form";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

export default async function PatientNewAppointmentPage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/patient/login");
  }

  // Buscar profissionais da clínica do paciente
  const professionals = await db.query.professionalsTable.findMany({
    where: eq(professionalsTable.clinicId, session.patient.clinic.id),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agendar Nova Consulta
            </h1>
            <p className="mt-1 text-gray-600">
              Escolha o profissional, data e horário para sua consulta
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {professionals.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              Nenhum profissional encontrado na sua clínica.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Entre em contato com a administração da clínica.
            </p>
          </div>
        ) : (
          <PatientNewAppointmentForm
            patientId={session.patient.id}
            clinicId={session.patient.clinic.id}
            professionals={professionals}
          />
        )}
      </div>
    </div>
  );
}
