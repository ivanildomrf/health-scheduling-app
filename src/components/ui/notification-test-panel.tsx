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
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationTestPanelProps {
  userId: string;
}

const notificationTypes = [
  { value: "appointment_confirmed", label: "Consulta confirmada" },
  { value: "appointment_cancelled", label: "Consulta cancelada" },
  { value: "appointment_reminder_24h", label: "Lembrete 24h" },
  { value: "appointment_reminder_2h", label: "Lembrete 2h" },
  { value: "appointment_completed", label: "Consulta concluída" },
  { value: "appointment_expired", label: "Consulta expirada" },
  { value: "new_patient_registered", label: "Novo paciente" },
  { value: "new_professional_added", label: "Novo profissional" },
  { value: "clinic_updated", label: "Clínica atualizada" },
  { value: "system_alert", label: "Alerta do sistema" },
] as const;

export function NotificationTestPanel({ userId }: NotificationTestPanelProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [count, setCount] = useState(1);

  const { execute: createTest, isExecuting } = useAction(
    createTestNotifications,
    {
      onSuccess: ({ data }) => {
        if (data?.data && "count" in data.data) {
          toast.success(
            `${data.data.count} notificação(ões) criada(s) com sucesso!`,
          );
        } else {
          toast.success("Notificações criadas com sucesso!");
        }
      },
      onError: ({ error }) => {
        toast.error("Erro ao criar notificações de teste");
        console.error("Erro ao criar notificações de teste:", error);
      },
    },
  );

  const handleCreateSpecific = () => {
    if (!selectedType) {
      toast.error("Selecione um tipo de notificação");
      return;
    }

    createTest({
      userId,
      type: selectedType as any,
      count,
    });
  };

  const handleCreateOneOfEach = () => {
    // Criar uma notificação de cada tipo
    const types = notificationTypes.map((t) => t.value);

    types.forEach((type, index) => {
      setTimeout(() => {
        createTest({
          userId,
          type: type as any,
          count: 1,
        });
      }, index * 500); // Espaçar as criações
    });
  };

  return (
    <Card className="border-dashed border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700">
          🧪 Painel de Teste - Notificações
        </CardTitle>
        <CardDescription className="text-xs text-orange-600">
          Apenas visível em ambiente de desenvolvimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Tipo de notificação */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Tipo de notificação" />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quantidade */}
          <Select
            value={count.toString()}
            onValueChange={(value) => setCount(parseInt(value))}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Quantidade" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} notificação{num > 1 ? "ões" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão de criar específico */}
          <Button
            onClick={handleCreateSpecific}
            disabled={isExecuting || !selectedType}
            size="sm"
            variant="outline"
            className="text-sm"
          >
            {isExecuting ? "Criando..." : "Criar"}
          </Button>
        </div>

        {/* Botão de criar uma de cada */}
        <div className="flex justify-center border-t border-orange-200 pt-2">
          <Button
            onClick={handleCreateOneOfEach}
            disabled={isExecuting}
            size="sm"
            variant="outline"
            className="border-orange-300 text-sm text-orange-700 hover:bg-orange-100"
          >
            {isExecuting ? "Criando..." : "Criar uma de cada tipo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
