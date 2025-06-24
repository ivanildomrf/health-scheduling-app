import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { Calendar, Clock, FileText, User } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { formatCurrencyInCentsToBRL } from "@/helpers/currency";
import { getPatientSession } from "@/helpers/patient-session";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

export default async function PatientHistoryPage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/patient/login");
  }

  // Buscar histórico de consultas (apenas completadas)
  const completedAppointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.patientId, session.patient.id),
    with: {
      professional: {
        columns: {
          name: true,
          speciality: true,
        },
      },
      clinic: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: (appointments, { desc }) => [desc(appointments.date)],
  });

  // Filtrar apenas consultas realizadas
  const medicalHistory = completedAppointments.filter(
    (appointment) => appointment.status === "completed",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Realizada";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico Médico</h1>
          <p className="mt-1 text-gray-600">
            Visualize suas consultas realizadas
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {medicalHistory.length} consulta(s) realizada(s)
          </span>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Consultas</p>
                <p className="text-xl font-bold text-gray-900">
                  {medicalHistory.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-2">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Especialidades</p>
                <p className="text-xl font-bold text-gray-900">
                  {
                    new Set(
                      medicalHistory.map((a) => a.professional.speciality),
                    ).size
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Última Consulta</p>
                <p className="text-xl font-bold text-gray-900">
                  {medicalHistory.length > 0
                    ? dayjs(medicalHistory[0].date).format("DD/MM/YY")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista do histórico */}
      <div className="space-y-4">
        {medicalHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Nenhuma consulta realizada
              </h3>
              <p className="text-gray-500">
                Seu histórico médico aparecerá aqui após suas consultas.
              </p>
            </CardContent>
          </Card>
        ) : (
          medicalHistory.map((appointment) => (
            <Card
              key={appointment.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-blue-100 p-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.professional.name}
                        </h3>
                        <Badge variant="secondary">
                          {appointment.professional.speciality}
                        </Badge>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>

                      <div className="mb-3 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {dayjs(appointment.date).format("DD/MM/YYYY")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{dayjs(appointment.date).format("HH:mm")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{appointment.clinic.name}</span>
                        </div>
                      </div>

                      {/* Informações adicionais que poderiam ser adicionadas futuramente */}
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-600">
                          <strong>Observações:</strong> Consulta realizada com
                          sucesso.
                          {/* Aqui poderia ter campos como diagnóstico, prescrições, etc. */}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrencyInCentsToBRL(
                        appointment.appointmentPriceInCents,
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Há {dayjs().diff(dayjs(appointment.date), "day")} dias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer informativo */}
      {medicalHistory.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <FileText className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Sobre seu histórico médico
                </h4>
                <p className="text-sm text-blue-700">
                  Este histórico contém apenas consultas já realizadas. Para ver
                  agendamentos futuros ou cancelados, acesse a página de
                  Agendamentos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
