import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PatientProfileForm } from "./components/patient-profile-form";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

// Funções para formatar dados
const formatPhone = (phone: string | null) => {
  if (!phone) return "";
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, "");
  // Aplica a máscara (11) 99999-9999
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  // Se não tem 11 dígitos, retorna como está
  return phone;
};

const formatCPF = (cpf: string | null) => {
  if (!cpf) return "";
  // Remove tudo que não é número
  const numbers = cpf.replace(/\D/g, "");
  // Aplica a máscara 123.456.789-00
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  // Se não tem 11 dígitos, retorna como está
  return cpf;
};

const formatCEP = (cep: string | null) => {
  if (!cep) return "";
  // Remove tudo que não é número
  const numbers = cep.replace(/\D/g, "");
  // Aplica a máscara 12345-678
  if (numbers.length === 8) {
    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
  }
  // Se não tem 8 dígitos, retorna como está
  return cep;
};

async function getPatientData(patientId: string) {
  const patient = await db
    .select({
      id: patientsTable.id,
      name: patientsTable.name,
      socialName: patientsTable.socialName,
      motherName: patientsTable.motherName,
      email: patientsTable.email,
      phone: patientsTable.phone,
      sex: patientsTable.sex,
      birthDate: patientsTable.birthDate,
      raceColor: patientsTable.raceColor,
      city: patientsTable.city,
      state: patientsTable.state,
      zipCode: patientsTable.zipCode,
      cpf: patientsTable.cpf,
      cnsNumber: patientsTable.cnsNumber,
      emergencyContact: patientsTable.emergencyContact,
      emergencyPhone: patientsTable.emergencyPhone,
      clinic: {
        id: patientsTable.clinicId,
        name: patientsTable.name, // Placeholder - would need to join with clinics table
      },
    })
    .from(patientsTable)
    .where(eq(patientsTable.id, patientId))
    .limit(1);

  return patient[0] || null;
}

export default async function PatientProfilePage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/patient/login");
  }

  const patientData = await getPatientData(session.patientId);

  if (!patientData) {
    redirect("/patient/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-1 text-gray-600">
            Gerencie suas informações pessoais e dados de contato
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
                    {patientData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {patientData.name}
                  </h2>
                  {patientData.socialName && (
                    <p className="text-sm text-gray-500">
                      Nome social: {patientData.socialName}
                    </p>
                  )}
                  <p className="text-gray-600">{patientData.email}</p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Clínica</p>
                  <p className="text-gray-900">{patientData.clinic.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-gray-900">
                    {formatPhone(patientData.phone)}
                  </p>
                </div>

                {patientData.cpf && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="text-gray-900">
                      {formatCPF(patientData.cpf)}
                    </p>
                  </div>
                )}

                {patientData.city && patientData.state && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Cidade/Estado
                    </p>
                    <p className="text-gray-900">
                      {patientData.city}, {patientData.state}
                    </p>
                  </div>
                )}

                {patientData.zipCode && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">CEP</p>
                    <p className="text-gray-900">
                      {formatCEP(patientData.zipCode)}
                    </p>
                  </div>
                )}

                {patientData.emergencyContact && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Contato de Emergência
                    </p>
                    <p className="text-gray-900">
                      {patientData.emergencyContact}
                    </p>
                    {patientData.emergencyPhone && (
                      <p className="text-sm text-gray-600">
                        {formatPhone(patientData.emergencyPhone)}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Sexo</p>
                  <p className="text-gray-900">
                    {patientData.sex === "male" ? "Masculino" : "Feminino"}
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
              <PatientProfileForm patientData={patientData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
