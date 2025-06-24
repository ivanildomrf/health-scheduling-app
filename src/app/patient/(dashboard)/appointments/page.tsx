import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { formatCurrencyInCentsToBRL } from "@/helpers/currency";
import { getPatientSession } from "@/helpers/patient-session";

import { CancelAppointmentModal } from "./components/cancel-appointment-modal";
import { RescheduleAppointmentModal } from "./components/reschedule-appointment-modal";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

export default async function PatientAppointmentsPage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/patient/login");
  }

  // Buscar agendamentos reais do banco
  const appointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.patientId, session.patient.id),
    with: {
      professional: {
        columns: {
          name: true,
          speciality: true,
        },
      },
    },
    orderBy: (appointments, { desc }) => [desc(appointments.date)],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Agendado";
      case "cancelled":
        return "Cancelado";
      case "expired":
        return "Expirado";
      case "completed":
        return "Realizado";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Meus Agendamentos
          </h1>
          <p className="mt-1 text-gray-600">Veja e gerencie suas consultas</p>
        </div>

        <Button asChild>
          <Link href="/patient/appointments/new">
            <Calendar className="mr-2 h-4 w-4" />
            Nova Consulta
          </Link>
        </Button>
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.professional.name}
                      </h3>
                      <Badge variant="secondary">
                        {appointment.professional.speciality}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="mb-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrencyInCentsToBRL(
                      appointment.appointmentPriceInCents,
                    )}
                  </p>

                  {appointment.status === "active" && (
                    <div className="mt-2 space-x-2">
                      <RescheduleAppointmentModal
                        appointmentId={appointment.id}
                        currentDate={appointment.date}
                        professionalName={appointment.professional.name}
                      >
                        <Button variant="outline" size="sm">
                          Remarcar
                        </Button>
                      </RescheduleAppointmentModal>

                      <CancelAppointmentModal
                        appointmentId={appointment.id}
                        appointmentDate={appointment.date}
                        professionalName={appointment.professional.name}
                      >
                        <Button variant="outline" size="sm">
                          Cancelar
                        </Button>
                      </CancelAppointmentModal>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {appointments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Nenhuma consulta encontrada
            </h3>
            <p className="mb-4 text-gray-500">
              Você ainda não possui agendamentos.
            </p>
            <Button asChild>
              <Link href="/patient/appointments/new">
                Agendar primeira consulta
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
