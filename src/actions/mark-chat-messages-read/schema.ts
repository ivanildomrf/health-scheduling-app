import { z } from "zod";

export const markChatMessagesReadSchema = z.object({
  conversationId: z.string().uuid("ID da conversa deve ser um UUID válido"),
  readerType: z.enum(["patient", "receptionist", "admin"], {
    required_error: "Tipo do leitor é obrigatório",
  }),
  readerId: z.string().min(1, "ID do leitor é obrigatório"),
  readerName: z.string().min(1, "Nome do leitor é obrigatório"),
});

export type MarkChatMessagesReadInput = z.infer<
  typeof markChatMessagesReadSchema
>;
