"use client";

import { Calendar, FileText, Settings, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientQuickActions() {
  const quickActions = [
    {
      title: "Agendar Consulta",
      description: "Marque uma nova consulta",
      icon: Calendar,
      href: "/patient/appointments/new",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Atualizar Perfil",
      description: "Edite suas informações",
      icon: User,
      href: "/patient/profile",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Histórico Médico",
      description: "Veja suas consultas anteriores",
      icon: FileText,
      href: "/patient/history",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Configurações",
      description: "Gerencie sua conta",
      icon: Settings,
      href: "/patient/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.title}
                variant="ghost"
                className="h-auto w-full justify-start p-4"
                asChild
              >
                <Link href={action.href}>
                  <div className="flex w-full items-center space-x-3">
                    <div className={`rounded-lg p-2 ${action.bgColor}`}>
                      <Icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
