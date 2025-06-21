"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, UserCheck, Users } from "lucide-react";

interface StatsCardsProps {
  revenue: number;
  totalAppointments: number;
  totalPatients: number;
  totalProfessionals: number;
}

export function StatsCards({
  revenue,
  totalAppointments,
  totalPatients,
  totalProfessionals,
}: StatsCardsProps) {
  // Formatação de moeda consistente
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const stats = [
    {
      title: "Faturamento",
      value: formatCurrency(revenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pacientes",
      value: totalPatients.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Médicos",
      value: totalProfessionals.toString(),
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="gap-2 transition-shadow hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className={`${stat.bgColor} flex items-center rounded-lg p-2`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
