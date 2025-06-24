"use client";

import dayjs from "dayjs";
import { Calendar, Clock, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

import { getPatientAppointments } from "@/actions/get-patient-appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientDashboardOverview() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });

  const [loading, setLoading] = useState(true);

  const getAppointmentsAction = useAction(getPatientAppointments, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data?.appointments) {
        const appointments = data.data.appointments;
        const now = dayjs();

        const totalAppointments = appointments.length;
        const upcomingAppointments = appointments.filter(
          (appointment) =>
            appointment.status === "active" &&
            dayjs(appointment.date).isAfter(now),
        ).length;
        const completedAppointments = appointments.filter(
          (appointment) => appointment.status === "completed",
        ).length;

        setStats({
          totalAppointments,
          upcomingAppointments,
          completedAppointments,
        });
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

  const overviewCards = [
    {
      title: "Total de Consultas",
      value: stats.totalAppointments,
      icon: Calendar,
      description: "Consultas realizadas e agendadas",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Próximas Consultas",
      value: stats.upcomingAppointments,
      icon: Clock,
      description: "Consultas agendadas",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Consultas Realizadas",
      value: stats.completedAppointments,
      icon: User,
      description: "Consultas finalizadas",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Visão Geral</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    card.value
                  )}
                </div>
                <p className="text-xs text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
