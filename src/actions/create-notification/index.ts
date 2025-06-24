"use server";

import { z } from "zod";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

const createNotificationSchema = z.object({
  type: z.enum([
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
  ]),
  title: z.string().min(1, "Título é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  targetId: z.string().uuid().optional(),
  targetType: z.string().optional(),
});

export const createNotification = actionClient
  .schema(createNotificationSchema)
  .action(async ({ parsedInput }) => {
    const { type, title, message, userId, targetId, targetType } = parsedInput;

    try {
      const [notification] = await db
        .insert(notificationsTable)
        .values({
          type,
          title,
          message,
          userId,
          targetId,
          targetType,
        })
        .returning();

      return {
        success: true,
        data: notification,
        message: "Notificação criada com sucesso",
      };
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw new Error("Erro interno do servidor");
    }
  });
  actionClient