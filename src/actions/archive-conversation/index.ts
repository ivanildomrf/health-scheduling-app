import { eq } from "drizzle-orm";

import { db } from "@/db";
import { chatConversationsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { archiveConversationSchema } from "./schema";

export const archiveConversation = actionClient
  .schema(archiveConversationSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("=== archiveConversation Action START ===");
      console.log("parsedInput:", parsedInput);

      const { conversationId, reason, userId } = parsedInput;

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

      console.log("Conversation archived:", updatedConversation);

      return {
        success: true,
        data: updatedConversation,
      };
    } catch (error) {
      console.error("Erro ao arquivar conversa:", error);
      throw new Error("Erro ao arquivar conversa");
    }
  });
