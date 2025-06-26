"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatMessagesTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { markChatMessagesReadSchema } from "./schema";

export const markChatMessagesRead = actionClient
  .schema(markChatMessagesReadSchema)
  .action(async ({ parsedInput }) => {
    const { conversationId, readerType, readerId, readerName } = parsedInput;

    try {
      // Buscar mensagens não lidas da conversa
      const unreadMessages = await db
        .select({
          id: chatMessagesTable.id,
        })
        .from(chatMessagesTable)
        .where(
          and(
            eq(chatMessagesTable.conversationId, conversationId),
            eq(chatMessagesTable.isRead, false),
            // Se o leitor for paciente, marcar apenas mensagens da recepção
            // Se o leitor for recepcionista, marcar apenas mensagens do paciente
            readerType === "patient"
              ? eq(chatMessagesTable.senderType, "receptionist")
              : eq(chatMessagesTable.senderType, "patient"),
          ),
        );

      // Se não houver mensagens não lidas, retornar
      if (unreadMessages.length === 0) {
        return {
          success: true,
          data: {
            messagesRead: 0,
            updatedMessages: [],
          },
        };
      }

      // Marcar mensagens como lidas
      const now = new Date();
      const updatedMessages = await db
        .update(chatMessagesTable)
        .set({
          isRead: true,
          readAt: now,
          readBy: readerType === "patient" ? null : readerId,
        })
        .where(
          and(
            eq(chatMessagesTable.conversationId, conversationId),
            eq(chatMessagesTable.isRead, false),
            // Se o leitor for paciente, marcar apenas mensagens da recepção
            // Se o leitor for recepcionista, marcar apenas mensagens do paciente
            readerType === "patient"
              ? eq(chatMessagesTable.senderType, "receptionist")
              : eq(chatMessagesTable.senderType, "patient"),
          ),
        )
        .returning();

      return {
        success: true,
        data: {
          messagesRead: updatedMessages.length,
          updatedMessages,
        },
      };
    } catch (error) {
      throw new Error("Falha ao marcar mensagens como lidas");
    }
  });
