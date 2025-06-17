"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";

const getNotificationsSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  limit: z.number().min(1).max(100).default(20),
  onlyUnread: z.boolean().default(false),
});

export const getNotifications = actionClient
  .schema(getNotificationsSchema)
  .action(async ({ parsedInput }) => {
    const { userId, limit, onlyUnread } = parsedInput;

    try {
      const whereConditions = onlyUnread
        ? and(
            eq(notificationsTable.userId, userId),
            eq(notificationsTable.isRead, false)
          )
        : eq(notificationsTable.userId, userId);

      const notifications = await db
        .select()
        .from(notificationsTable)
        .where(whereConditions)
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit);

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      throw new Error("Erro interno do servidor");
    }
  });
