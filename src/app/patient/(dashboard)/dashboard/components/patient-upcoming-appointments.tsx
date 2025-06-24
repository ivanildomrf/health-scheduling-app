"use client";

import dayjs from "dayjs";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

import { getPatientAppointments } from "@/actions/get-patient-appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCentsToBRL } from "@/helpers/currency";

interface Appointment {
  id: string;
  date: Date;
  professional: {
    name: string;
    speciality: string;
  };
  appointmentPriceInCents: number;
  status: "active" | "cancelled" | "expired" | "completed";
}

export function PatientUpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const getAppointmentsAction = useAction(getPatientAppointments, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data?.appointments) {
        // Filtrar apenas agendamentos ativos e futuros
        const upcomingAppointments = data.data.appointments
          .filter((appointment) => {
            return (
              appointment.status === "active" &&
              dayjs(appointment.date).isAfter(dayjs())
            );
          })
          .slice(0, 3); // Mostrar apenas os próximos 3

        setAppointments(upcomingAppointments);
      }
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  useEffect(() => {
    getAppointmentsAction.execute({});
  }, []);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 rounded-lg bg-gray-200"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximas Consultas</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/patient/appointments">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">Nenhuma consulta agendada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
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
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrencyInCentsToBRL(
                      appointment.appointmentPriceInCents,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
