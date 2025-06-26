"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  chatConversationsTable,
  chatMessagesTable,
  chatUnreadMessagesTable,
} from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { sendChatMessageSchema } from "./schema";

export const sendChatMessage = actionClient
  .schema(sendChatMessageSchema)
  .action(async ({ parsedInput }) => {
    const {
      conversationId,
      content,
      senderType,
      senderPatientId,
      senderUserId,
      senderName,
    } = parsedInput;

    console.log("=== sendChatMessage Action START ===");
    console.log("parsedInput:", parsedInput);

    try {
      // Criar nova mensagem
      const [newMessage] = await db
        .insert(chatMessagesTable)
        .values({
          conversationId,
          content,
          senderType,
          senderPatientId,
          senderUserId,
          senderName,
          messageType: "text",
        })
        .returning();

      console.log("Message created:", newMessage);

      // Atualizar timestamp da última mensagem na conversa
      await db
        .update(chatConversationsTable)
        .set({
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(chatConversationsTable.id, conversationId));

      // Atualizar contador de mensagens não lidas
      const recipientType =
        senderType === "patient" ? "receptionist" : "patient";

      // Incrementar contador de mensagens não lidas
      const [currentUnread] = await db
        .select({ unreadCount: chatUnreadMessagesTable.unreadCount })
        .from(chatUnreadMessagesTable)
        .where(
          and(
            eq(chatUnreadMessagesTable.conversationId, conversationId),
            eq(chatUnreadMessagesTable.userType, recipientType),
          ),
        )
        .limit(1);

      if (currentUnread) {
        await db
          .update(chatUnreadMessagesTable)
          .set({
            unreadCount: currentUnread.unreadCount + 1,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(chatUnreadMessagesTable.conversationId, conversationId),
              eq(chatUnreadMessagesTable.userType, recipientType),
            ),
          );
      } else {
        // Criar registro inicial se não existir
        await db.insert(chatUnreadMessagesTable).values({
          conversationId,
          userType: recipientType,
          patientId: senderType === "patient" ? null : senderPatientId,
          unreadCount: 1,
          lastReadAt: new Date(),
        });
      }

      return {
        success: true,
        data: newMessage,
      };
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw new Error("Falha ao enviar mensagem");
    }
  });
