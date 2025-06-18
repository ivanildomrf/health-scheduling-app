"use client";

import { createTestNotifications } from "@/actions/create-test-notifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotificationType } from "@/lib/types/notifications";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationTestPanelProps {
  userId: string;
  onNotificationsCreated?: () => void;
}

const notificationTypeLabels: Record<NotificationType, string> = {
  appointment_confirmed: "📅 Consulta Confirmada",
  appointment_cancelled: "❌ Consulta Cancelada",
  appointment_reminder_24h: "⏰ Lembrete 24h",
  appointment_reminder_2h: "⏰ Lembrete 2h",
  appointment_completed: "✅ Consulta Concluída",
  appointment_expired: "⏳ Consulta Expirada",
  new_patient_registered: "👤 Novo Paciente",
  new_professional_added: "👨‍⚕️ Novo Profissional",
  clinic_updated: "🏥 Clínica Atualizada",
  system_alert: "⚠️ Alerta do Sistema",
};

export function NotificationTestPanel({
  userId,
  onNotificationsCreated,
}: NotificationTestPanelProps) {
  const [selectedType, setSelectedType] =
    useState<NotificationType>("system_alert");
  const [count, setCount] = useState(1);

  const { execute: createTest, isExecuting } = useAction(
    createTestNotifications,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          toast.success(
            `${data.data.count} notificação(ões) de teste criada(s) com sucesso!`,
          );
          onNotificationsCreated?.();
        }
      },
      onError: ({ error }) => {
        toast.error("Erro ao criar notificações de teste");
        console.error("Erro:", error);
      },
    },
  );

  const handleCreateTest = () => {
    createTest({
      userId,
      type: selectedType,
      count,
    });
  };

  const handleCreateAllTypes = () => {
    const types = Object.keys(notificationTypeLabels) as NotificationType[];

    types.forEach((type, index) => {
      setTimeout(() => {
        createTest({
          userId,
          type,
          count: 1,
        });
      }, index * 500); // Espaçar as criações para evitar conflitos
    });
  };

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          🧪 Painel de Teste
        </CardTitle>
        <CardDescription>
          Use este painel para criar notificações de teste e verificar se o
          sistema está funcionando corretamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Notificação</label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setSelectedType(value as NotificationType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(notificationTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade</label>
            <Select
              value={count.toString()}
              onValueChange={(value) => setCount(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} notificação(ões)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ações</label>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateTest}
                disabled={isExecuting}
                size="sm"
                className="flex-1"
              >
                {isExecuting ? "Criando..." : "Criar Teste"}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            onClick={handleCreateAllTypes}
            disabled={isExecuting}
            variant="outline"
            className="w-full"
          >
            🎯 Criar uma de cada tipo (10 notificações)
          </Button>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p>
            <strong>💡 Dica:</strong> Use este painel apenas em ambiente de
            desenvolvimento/teste.
          </p>
          <p>
            As notificações criadas aqui são apenas para demonstração e teste do
            sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
