import { and, eq, lt } from "drizzle-orm";

import { db } from "@/db";
import { chatConversationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

export const autoArchiveConversations = actionClient.action(async () => {
  try {
    console.log("=== autoArchiveConversations Action START ===");

    // Data limite: 1 dia atrás
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    console.log("Arquivando conversas sem atividade desde:", oneDayAgo);

    // Buscar conversas ativas sem atividade há mais de 1 dia
    const conversationsToArchive = await db
      .update(chatConversationsTable)
      .set({
        status: "archived",
        resolvedAt: new Date(),
        resolvedBy: "Arquivada automaticamente por inatividade",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(chatConversationsTable.status, "active"),
          lt(chatConversationsTable.lastMessageAt, oneDayAgo)
        )
      )
      .returning();

    console.log(`Conversas arquivadas automaticamente: ${conversationsToArchive.length}`);

    return {
      success: true,
      data: {
        archivedCount: conversationsToArchive.length,
        conversations: conversationsToArchive,
      },
    };
  } catch (error) {
    console.error("Erro ao arquivar conversas automaticamente:", error);
    throw new Error("Erro ao arquivar conversas automaticamente");
  }
}); 