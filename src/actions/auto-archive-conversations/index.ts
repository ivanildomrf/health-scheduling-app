import { and, eq, lt } from "drizzle-orm";

import { db } from "@/db";
import { chatConversationsTable } from "@/db/schema";
import { type ChatConversation } from "@/db/types";
import { actionClient } from "@/lib/safe-action";

interface AutoArchiveConversationsResult {
  success: boolean;
  data: {
    archivedCount: number;
    conversations: ChatConversation[];
  };
}

export const autoArchiveConversations = actionClient.action(async () => {
  try {
    // Data limite: 1 dia atrás
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

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
          lt(chatConversationsTable.lastMessageAt, oneDayAgo),
        ),
      )
      .returning();

    return {
      success: true,
      data: {
        archivedCount: conversationsToArchive.length,
        conversations: conversationsToArchive,
      },
    } satisfies AutoArchiveConversationsResult;
  } catch {
    throw new Error("Erro ao arquivar conversas automaticamente");
  }
});
