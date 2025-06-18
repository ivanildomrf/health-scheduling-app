"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import type { NotificationType } from "@/lib/types/notifications";
import { z } from "zod";

const createTestNotificationsSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  type: z
    .enum([
      "appointment_confirmed",
      "appointment_cancelled",
      "appointment_reminder_24h",
      "appointment_reminder_2h",
      "appointment_completed",
      "appointment_expired",
      "new_patient_registered",
      "new_professional_added",
      "clinic_updated",
      "system_alert",
    ])
    .default("system_alert"),
  count: z.number().min(1).max(10).default(1),
});

export const createTestNotifications = actionClient
  .schema(createTestNotificationsSchema)
  .action(async ({ parsedInput }) => {
    const { userId, type, count } = parsedInput;

    try {
      const notifications = [];

      for (let i = 0; i < count; i++) {
        const testData = getTestNotificationData(type, i + 1);

        const [notification] = await db
          .insert(notificationsTable)
          .values({
            type: testData.type,
            title: testData.title,
            message: testData.message,
            userId,
            targetId: testData.targetId,
            targetType: testData.targetType,
          })
          .returning();

        if (notification) {
          notifications.push(notification);
        }
      }

      return {
        success: true,
        data: {
          notifications,
          count: notifications.length,
        },
      };
    } catch (error) {
      console.error("Erro ao criar notificações de teste:", error);
      throw new Error("Erro interno do servidor");
    }
  });

function getTestNotificationData(type: NotificationType, index: number) {
  const baseData = {
    targetId: undefined, // Para testes, não precisamos de um targetId específico
    targetType: "system" as const,
  };

  // Nomes fictícios para os testes
  const patientNames = [
    "João Silva",
    "Maria Santos",
    "Ana Costa",
    "Pedro Oliveira",
    "Carla Mendes",
  ];
  const professionalNames = [
    "Dr. Carlos Silva",
    "Dra. Ana Rodrigues",
    "Dr. João Pereira",
    "Dra. Maria Fernandes",
  ];
  const patientName = patientNames[(index - 1) % patientNames.length];
  const professionalName =
    professionalNames[(index - 1) % professionalNames.length];
  const today = new Date().toLocaleDateString("pt-BR");
  const tomorrow = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toLocaleDateString("pt-BR");

  switch (type) {
    case "appointment_confirmed":
      return {
        ...baseData,
        type,
        title: `Consulta Confirmada - ${patientName}`,
        message: `A consulta do paciente ${patientName} com ${professionalName} para ${today} às 14:00 foi confirmada.`,
        targetType: "appointment" as const,
      };

    case "appointment_cancelled":
      return {
        ...baseData,
        type,
        title: `Consulta Cancelada - ${patientName}`,
        message: `A consulta do paciente ${patientName} com ${professionalName} para ${today} às 15:30 foi cancelada. Reagendamento necessário.`,
        targetType: "appointment" as const,
      };

    case "appointment_reminder_24h":
      return {
        ...baseData,
        type,
        title: `Lembrete 24h - Consultas de Amanhã`,
        message: `Lembrete: ${patientName} tem consulta agendada com ${professionalName} amanhã (${tomorrow}) às 14:00.`,
        targetType: "appointment" as const,
      };

    case "appointment_reminder_2h":
      return {
        ...baseData,
        type,
        title: `Consulta em 2 Horas - ${patientName}`,
        message: `Atenção: Consulta do paciente ${patientName} com ${professionalName} está próxima (16:00). Preparar atendimento.`,
        targetType: "appointment" as const,
      };

    case "appointment_completed":
      return {
        ...baseData,
        type,
        title: `Consulta Finalizada - ${patientName}`,
        message: `A consulta do paciente ${patientName} com ${professionalName} foi concluída com sucesso. Registros atualizados.`,
        targetType: "appointment" as const,
      };

    case "appointment_expired":
      return {
        ...baseData,
        type,
        title: `Consulta Não Realizada - ${patientName}`,
        message: `A consulta agendada do paciente ${patientName} com ${professionalName} não foi realizada e foi marcada como expirada.`,
        targetType: "appointment" as const,
      };

    case "new_patient_registered":
      return {
        ...baseData,
        type,
        title: `Novo Paciente Cadastrado`,
        message: `O paciente ${patientName} foi cadastrado no sistema. Dados: telefone (11) 9999-${1000 + index}, email ${patientName.toLowerCase().replace(" ", ".")}@email.com`,
        targetType: "patient" as const,
      };

    case "new_professional_added":
      return {
        ...baseData,
        type,
        title: `Novo Profissional Adicionado`,
        message: `${professionalName} foi adicionado à equipe da clínica. Especialidade: ${index % 2 === 0 ? "Cardiologia" : "Pediatria"}. Agenda disponível para agendamentos.`,
        targetType: "professional" as const,
      };

    case "clinic_updated":
      return {
        ...baseData,
        type,
        title: `Informações da Clínica Atualizadas`,
        message: `As informações da clínica foram atualizadas com sucesso. Verifique os novos dados no sistema de gestão.`,
        targetType: "clinic" as const,
      };

    case "system_alert":
      return {
        ...baseData,
        type,
        title: `Alerta do Sistema #${index}`,
        message: `Sistema de notificações funcionando corretamente. Esta é uma notificação de teste para verificar a funcionalidade da plataforma de gestão.`,
        targetType: "system" as const,
      };

    default:
      return {
        ...baseData,
        type: "system_alert" as const,
        title: `Notificação de Teste #${index}`,
        message: `Esta é uma notificação de teste genérica do sistema de gestão da clínica.`,
        targetType: "system" as const,
      };
  }
}
