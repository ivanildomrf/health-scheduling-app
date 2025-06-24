"use client";

import { Bell, Clock, Clock4 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { sendAppointmentReminders } from "@/actions/send-appointment-reminders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

export default function NotificationAdminPage() {
  const { execute: sendReminders24h, isExecuting: isSending24h } = useAction(
    sendAppointmentReminders,
    {
      onSuccess: (result) => {
        toast.success(
          `Lembretes de 24h enviados: ${result.data?.sentCount || 0}`,
        );
      },
      onError: (error) => {
        toast.error("Erro ao enviar lembretes de 24h");
        console.error("Erro:", error);
      },
    },
  );

  const { execute: sendReminders2h, isExecuting: isSending2h } = useAction(
    sendAppointmentReminders,
    {
      onSuccess: (result) => {
        toast.success(
          `Lembretes de 2h enviados: ${result.data?.sentCount || 0}`,
        );
      },
      onError: (error) => {
        toast.error("Erro ao enviar lembretes de 2h");
        console.error("Erro:", error);
      },
    },
  );

  const handleSend24hReminders = () => {
    sendReminders24h({ reminderType: "24h" });
  };

  const handleSend2hReminders = () => {
    sendReminders2h({ reminderType: "2h" });
  };

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Administração de Notificações</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock4 className="h-5 w-5" />
              Lembretes de 24 Horas
            </CardTitle>
            <CardDescription>
              Envia lembretes para consultas que acontecerão nas próximas 24
              horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSend24hReminders}
              disabled={isSending24h}
              className="w-full"
            >
              {isSending24h ? "Enviando..." : "Enviar Lembretes de 24h"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lembretes de 2 Horas
            </CardTitle>
            <CardDescription>
              Envia lembretes para consultas que acontecerão nas próximas 2
              horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSend2hReminders}
              disabled={isSending2h}
              className="w-full"
            >
              {isSending2h ? "Enviando..." : "Enviar Lembretes de 2h"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instruções para Automação</CardTitle>
          <CardDescription>
            Para usar os lembretes automaticamente em produção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-medium">Cron Jobs no Servidor</h3>
            <p className="text-muted-foreground mb-2 text-sm">
              Configure estes cron jobs no seu servidor para envio automático:
            </p>
            <code className="bg-muted block rounded p-2 text-sm">
              # Lembretes de 24h - todo dia às 9:00
              <br />0 9 * * * curl -X POST
              https://sua-app.com/api/cron/reminders-24h
              <br />
              <br />
              # Lembretes de 2h - a cada 2 horas
              <br />0 */2 * * * curl -X POST
              https://sua-app.com/api/cron/reminders-2h
            </code>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Endpoints de API</h3>
            <p className="text-muted-foreground text-sm">
              Você pode chamar essas URLs diretamente ou usar ferramentas como
              Vercel Cron, GitHub Actions, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
