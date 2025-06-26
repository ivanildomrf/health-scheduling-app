import { z } from "zod";

export const getChatMessagesSchema = z.object({
  conversationId: z.string().uuid("ID da conversa deve ser um UUID válido"),
  limit: z.number().int().min(1).max(100).optional(),
});

export type GetChatMessagesInput = z.infer<typeof getChatMessagesSchema>;
