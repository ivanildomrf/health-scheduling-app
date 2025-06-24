"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Configurar locale para português
dayjs.locale("pt-br");

interface RecentAppointmentsProps {
  appointments: Array<{
    id: string;
    date: Date;
    patientName: string;
    professionalName: string;
    status: "active" | "cancelled" | "expired" | "completed";
  }>;
}

const statusConfig = {
  active: {
    label: "Confirmado",
    variant: "default" as const,
    color: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive" as const,
    color: "bg-red-100 text-red-800",
  },
  expired: {
    label: "Expirado",
    variant: "secondary" as const,
    color: "bg-gray-100 text-gray-800",
  },
  completed: {
    label: "Concluído",
    variant: "default" as const,
    color: "bg-blue-100 text-blue-800",
  },
};

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  const formatDate = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY HH:mm");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">📅 Agendamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {appointment.patientName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(appointment.date)}
              </p>
              <p className="truncate text-xs text-gray-500">
                Dr. {appointment.professionalName}
              </p>
            </div>

            <Badge
              variant={statusConfig[appointment.status].variant}
              className={`text-xs ${statusConfig[appointment.status].color}`}
            >
              {statusConfig[appointment.status].label}
            </Badge>
          </div>
        ))}

        {appointments.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            Nenhum agendamento encontrado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
