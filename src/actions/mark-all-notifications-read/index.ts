"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

const markAllNotificationsReadSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
});

export const markAllNotificationsRead = actionClient
  .schema(markAllNotificationsReadSchema)
  .action(async ({ parsedInput }) => {
    const { userId } = parsedInput;

    try {
      const updatedNotifications = await db
        .update(notificationsTable)
        .set({
          isRead: true,
          updatedAt: new Date(),
        })
        .where(eq(notificationsTable.userId, userId))
        .returning();

      return {
        success: true,
        data: {
          count: updatedNotifications.length,
          notifications: updatedNotifications,
        },
        message: `${updatedNotifications.length} notificações marcadas como lidas`,
      };
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      throw new Error("Erro interno do servidor");
    }
  });
