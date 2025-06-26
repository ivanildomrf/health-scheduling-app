"use server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatConversationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { getPatientConversationsSchema } from "./schema";

export const getPatientConversations = actionClient
  .schema(getPatientConversationsSchema)
  .action(async ({ parsedInput }) => {
    const { patientId } = parsedInput;

    console.log("=== getPatientConversations Action START ===");
    console.log("parsedInput:", parsedInput);

    try {
      // Buscar conversas do paciente
      const conversations = await db
        .select({
          id: chatConversationsTable.id,
          subject: chatConversationsTable.subject,
          status: chatConversationsTable.status,
          priority: chatConversationsTable.priority,
          lastMessageAt: chatConversationsTable.lastMessageAt,
          createdAt: chatConversationsTable.createdAt,
        })
        .from(chatConversationsTable)
        .where(eq(chatConversationsTable.patientId, patientId))
        .orderBy(desc(chatConversationsTable.lastMessageAt));

      console.log("Conversations found:", conversations.length);

      // Adicionar contador de mensagens não lidas (por enquanto, retornar 0)
      const conversationsWithUnread = conversations.map((conv) => ({
        ...conv,
        unreadCount: 0, // TODO: Implementar contagem real de mensagens não lidas
      }));

      return {
        success: true,
        data: conversationsWithUnread,
      };
    } catch (error) {
      console.error("Erro ao buscar conversas do paciente:", error);
      throw new Error("Falha ao buscar conversas");
    }
  });
