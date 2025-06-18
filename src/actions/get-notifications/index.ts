"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const getNotificationsSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  type: z.string().optional(),
  isRead: z.boolean().optional(),
});

export const getNotifications = actionClient
  .schema(getNotificationsSchema)
  .action(async ({ parsedInput }) => {
    const { userId, limit, offset, type, isRead } = parsedInput;

    try {
      let query = db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.userId, userId))
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit)
        .offset(offset);

      // Aplicar filtros opcionais
      if (type) {
        query = query.where(eq(notificationsTable.type, type as any));
      }

      if (typeof isRead === "boolean") {
        query = query.where(eq(notificationsTable.isRead, isRead));
      }

      const notifications = await query;

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      console.error("❌ getNotifications - Erro:", error);
      throw new Error("Erro ao buscar notificações");
    }
  });
