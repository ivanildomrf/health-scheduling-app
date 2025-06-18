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
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Settings,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface NotificationTestPanelProps {
  userId: string;
}

export function NotificationTestPanel({ userId }: NotificationTestPanelProps) {
  const { execute: createTests, isExecuting } = useAction(
    createTestNotifications,
    {
      onSuccess: () => {
        toast.success("Notificações de teste criadas com sucesso!");
      },
      onError: (error) => {
        toast.error("Erro ao criar notificações de teste");
        console.error("Erro:", error);
      },
    },
  );

  const handleCreateTests = () => {
    createTests({ userId });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Painel de Testes de Notificações
          </CardTitle>
          <CardDescription>
            Crie notificações de exemplo para testar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateTests}
            disabled={isExecuting}
            className="w-full"
          >
            {isExecuting ? "Criando..." : "Criar Notificações de Teste"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Integração Automática Ativa
          </CardTitle>
          <CardDescription>
            As notificações agora são criadas automaticamente nas seguintes
            situações:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Agendamentos Confirmados</h4>
                  <p className="text-muted-foreground text-sm">
                    Quando uma nova consulta é criada no sistema
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium">Agendamentos Cancelados</h4>
                  <p className="text-muted-foreground text-sm">
                    Quando uma consulta é cancelada
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Consultas Concluídas</h4>
                  <p className="text-muted-foreground text-sm">
                    Quando uma consulta é marcada como finalizada
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium">Consultas Expiradas</h4>
                  <p className="text-muted-foreground text-sm">
                    Quando uma consulta não é realizada
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                <UserPlus className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Novos Pacientes</h4>
                  <p className="text-muted-foreground text-sm">
                    Quando um novo paciente é cadastrado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
                <UserCheck className="h-5 w-5 text-teal-600" />
                <div>
                  <h4 className="font-medium">Novos Profissionais</h4>
                  <p className="text-muted-foreground text-sm">
                    Quando um novo profissional é adicionado à equipe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sistema de Lembretes Automáticos
          </CardTitle>
          <CardDescription>
            Lembretes são enviados automaticamente para consultas futuras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <h4 className="font-medium">Lembrete 24h</h4>
                  <p className="text-muted-foreground text-sm">
                    Um dia antes da consulta
                  </p>
                </div>
              </div>
              <span className="rounded bg-yellow-100 px-2 py-1 text-xs dark:bg-yellow-900/40">
                Automático
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-red-600" />
                <div>
                  <h4 className="font-medium">Lembrete 2h</h4>
                  <p className="text-muted-foreground text-sm">
                    Duas horas antes da consulta
                  </p>
                </div>
              </div>
              <span className="rounded bg-red-100 px-2 py-1 text-xs dark:bg-red-900/40">
                Automático
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
