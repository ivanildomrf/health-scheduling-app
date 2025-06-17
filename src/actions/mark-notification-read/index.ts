"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid("ID da notificação deve ser um UUID válido"),
  userId: z.string().min(1, "ID do usuário é obrigatório"),
});

export const markNotificationRead = actionClient
  .schema(markNotificationReadSchema)
  .action(async ({ parsedInput }) => {
    const { notificationId, userId } = parsedInput;

    try {
      const [updatedNotification] = await db
        .update(notificationsTable)
        .set({
          isRead: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(notificationsTable.id, notificationId),
            eq(notificationsTable.userId, userId),
          ),
        )
        .returning();

      if (!updatedNotification) {
        throw new Error(
          "Notificação não encontrada ou não pertence ao usuário",
        );
      }

      return {
        success: true,
        data: updatedNotification,
        message: "Notificação marcada como lida",
      };
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      throw new Error("Erro interno do servidor");
    }
  });
