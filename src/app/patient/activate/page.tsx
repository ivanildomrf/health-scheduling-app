import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { and, eq, gt, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ActivateAccountForm } from "./components/activate-account-form";

interface ActivatePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ActivatePage({
  searchParams,
}: ActivatePageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/patient/login?error=token_missing");
  }

  // Verificar se o token é válido e não expirou
  const patient = await db
    .select()
    .from(patientsTable)
    .where(
      and(
        eq(patientsTable.activationToken, token),
        isNotNull(patientsTable.activationTokenExpiresAt),
        gt(patientsTable.activationTokenExpiresAt, new Date()),
      ),
    )
    .limit(1);

  if (patient.length === 0) {
    redirect("/patient/login?error=token_invalid");
  }

  const patientData = patient[0];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Ativar Conta
            </h1>
            <p className="text-gray-600">
              Olá, <strong>{patientData.name}</strong>!
              <br />
              Defina sua senha para acessar o Portal do Paciente.
            </p>
          </div>

          <ActivateAccountForm
            patientId={patientData.id}
            email={patientData.email}
            token={token}
          />
        </div>
      </div>
    </div>
  );
}
