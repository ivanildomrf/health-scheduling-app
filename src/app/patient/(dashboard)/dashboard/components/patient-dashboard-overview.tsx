"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import { useEffect, useState } from "react";

interface PatientDashboardOverviewProps {
  patientId: string;
}

export function PatientDashboardOverview({
  patientId,
}: PatientDashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });

  useEffect(() => {
    // TODO: Implementar busca das estatísticas do paciente
    // Por enquanto, dados mockados
    setStats({
      totalAppointments: 12,
      upcomingAppointments: 2,
      completedAppointments: 10,
    });
  }, [patientId]);

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
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
