"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

const getUnreadNotificationsCountSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
});

export const getUnreadNotificationsCount = actionClient
  .schema(getUnreadNotificationsCountSchema)
  .action(async ({ parsedInput }) => {
    const { userId } = parsedInput;

    try {
      const [result] = await db
        .select({ count: count() })
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.userId, userId),
            eq(notificationsTable.isRead, false),
          ),
        );

      return {
        success: true,
        data: {
          count: result.count,
        },
      };
    } catch (error) {
      console.error("Erro ao contar notificações não lidas:", error);
      throw new Error("Erro interno do servidor");
    }
  });
