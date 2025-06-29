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
  messageType: z.enum(["text", "image", "file", "system"]).default("text"),
  attachmentUrl: z.string().url("URL do anexo inválida").nullable().optional(),
  attachmentName: z.string().nullable().optional(),
  attachmentSize: z.number().int().positive().nullable().optional(),
  attachmentMimeType: z.string().nullable().optional(),
  isSystemMessage: z.boolean().default(false),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
