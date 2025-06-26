"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatUnreadMessagesTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { markChatMessagesReadSchema } from "./schema";

export const markChatMessagesRead = actionClient
  .schema(markChatMessagesReadSchema)
  .action(async ({ parsedInput }) => {
    const { conversationId, userType, userId, patientId } = parsedInput;

    try {
      // Atualizar contador de mensagens não lidas para zero
      const updateConditions = [
        eq(chatUnreadMessagesTable.conversationId, conversationId),
        eq(chatUnreadMessagesTable.userType, userType),
      ];

      if (userId) {
        updateConditions.push(eq(chatUnreadMessagesTable.userId, userId));
      }

      if (patientId) {
        updateConditions.push(eq(chatUnreadMessagesTable.patientId, patientId));
      }

      await db
        .update(chatUnreadMessagesTable)
        .set({
          unreadCount: 0,
          lastReadAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(...updateConditions));

      // Nota: revalidatePath removido para compatibilidade com componentes client

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao marcar mensagens como lidas:", error);
      throw new Error("Falha ao marcar mensagens como lidas");
    }
  });
