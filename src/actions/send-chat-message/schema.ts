import { z } from "zod";

export const sendChatMessageSchema = z.object({
  conversationId: z.string().uuid("ID da conversa deve ser um UUID válido"),
  content: z
    .string()
    .min(1, "Mensagem não pode estar vazia")
    .max(2000, "Mensagem deve ter no máximo 2000 caracteres"),
  senderType: z.enum(["patient", "receptionist", "admin"]),
  senderPatientId: z.string().uuid().optional(),
  senderUserId: z.string().optional(),
  senderName: z.string().min(1, "Nome do remetente é obrigatório"),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
