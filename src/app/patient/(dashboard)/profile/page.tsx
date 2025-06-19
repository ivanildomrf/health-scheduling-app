import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatientSession } from "@/helpers/patient-session";
import { redirect } from "next/navigation";
import { PatientProfileForm } from "./components/patient-profile-form";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/patient/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-1 text-gray-600">
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Informações básicas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-100 text-lg text-blue-600">
                    {session.patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {session.patient.name}
                  </h2>
                  <p className="text-gray-600">{session.patient.email}</p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Clínica</p>
                  <p className="text-gray-900">{session.patient.clinic.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-gray-900">{session.patient.phone}</p>
                </div>

                {session.patient.cpf && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="text-gray-900">{session.patient.cpf}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Sexo</p>
                  <p className="text-gray-900">
                    {session.patient.sex === "male" ? "Masculino" : "Feminino"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de edição */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editar Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientProfileForm patient={session.patient} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
