"use server";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatMessagesTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { getChatMessagesSchema } from "./schema";

export const getChatMessages = actionClient
  .schema(getChatMessagesSchema)
  .action(async ({ parsedInput }) => {
    const { conversationId, limit = 50 } = parsedInput;

    console.log("=== getChatMessages Action START ===");
    console.log("parsedInput:", parsedInput);

    try {
      // Buscar mensagens da conversa
      const messages = await db
        .select({
          id: chatMessagesTable.id,
          content: chatMessagesTable.content,
          senderType: chatMessagesTable.senderType,
          senderName: chatMessagesTable.senderName,
          messageType: chatMessagesTable.messageType,
          attachmentUrl: chatMessagesTable.attachmentUrl,
          attachmentName: chatMessagesTable.attachmentName,
          isSystemMessage: chatMessagesTable.isSystemMessage,
          createdAt: chatMessagesTable.createdAt,
        })
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.conversationId, conversationId))
        .orderBy(asc(chatMessagesTable.createdAt))
        .limit(limit);

      console.log("Messages found:", messages.length);

      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      throw new Error("Falha ao buscar mensagens");
    }
  });
