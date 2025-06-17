"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const deleteNotificationSchema = z.object({
  notificationId: z.string().uuid("ID da notificação deve ser um UUID válido"),
  userId: z.string().min(1, "ID do usuário é obrigatório"),
});

export const deleteNotification = actionClient
  .schema(deleteNotificationSchema)
  .action(async ({ parsedInput }) => {
    const { notificationId, userId } = parsedInput;

    try {
      const [deletedNotification] = await db
        .delete(notificationsTable)
        .where(
          and(
            eq(notificationsTable.id, notificationId),
            eq(notificationsTable.userId, userId),
          ),
        )
        .returning();

      if (!deletedNotification) {
        throw new Error(
          "Notificação não encontrada ou não pertence ao usuário",
        );
      }

      return {
        success: true,
        data: deletedNotification,
        message: "Notificação deletada com sucesso",
      };
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
      throw new Error("Erro interno do servidor");
    }
  });
