import { eq } from "drizzle-orm";

import { db } from "@/db";
import { chatConversationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { archiveConversationSchema } from "./schema";

export const archiveConversation = actionClient
  .schema(archiveConversationSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { conversationId, userId } = parsedInput;

      // Atualizar status da conversa para 'archived'
      const [updatedConversation] = await db
        .update(chatConversationsTable)
        .set({
          status: "archived",
          resolvedAt: new Date(),
          resolvedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(chatConversationsTable.id, conversationId))
        .returning();

      if (!updatedConversation) {
        throw new Error("Conversa não encontrada");
      }

      return {
        success: true,
        data: updatedConversation,
      };
    } catch {
      throw new Error("Erro ao arquivar conversa");
    }
  });
