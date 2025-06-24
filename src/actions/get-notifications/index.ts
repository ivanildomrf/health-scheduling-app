"use server";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

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
      // Construir condições de filtro
      const conditions = [eq(notificationsTable.userId, userId)];

      if (type) {
        conditions.push(eq(notificationsTable.type, type as any));
      }

      if (typeof isRead === "boolean") {
        conditions.push(eq(notificationsTable.isRead, isRead));
      }

      const notifications = await db
        .select()
        .from(notificationsTable)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      throw new Error("Erro ao buscar notificações");
    }
  });
