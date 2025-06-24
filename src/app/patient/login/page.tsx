import Image from "next/image";
import { redirect } from "next/navigation";

import { getPatientSession } from "@/helpers/patient-session";
import { APP_CONFIG } from "@/lib/constants";

import { PatientLoginForm } from "./components/patient-login-form";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

export default async function PatientLoginPage() {
  const session = await getPatientSession();

  // Se já está logado, redirecionar para dashboard
  if (session) {
    redirect("/patient/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="mx-auto flex h-16 w-auto items-center justify-center">
            <Image
              src={APP_CONFIG.logo.local}
              alt={APP_CONFIG.name}
              width={150}
              height={40}
              className="h-18 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Portal do Paciente
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700">
            Faça login para acessar seus agendamentos
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-100 to-slate-200 px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <PatientLoginForm />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-700">
            Problemas para acessar? Entre em contato com a clínica.
          </p>
        </div>
      </div>
    </div>
  );
}
