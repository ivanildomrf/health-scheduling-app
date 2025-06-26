import { z } from "zod";

export const markChatMessagesReadSchema = z.object({
  conversationId: z.string().min(1, "ID da conversa é obrigatório"), // Temporariamente relaxado para dados mock
  userType: z.enum(["patient", "receptionist", "admin"]),
  userId: z.string().optional(),
  patientId: z.string().optional(), // Temporariamente relaxado para dados mock
});

export type MarkChatMessagesReadInput = z.infer<
  typeof markChatMessagesReadSchema
>;
