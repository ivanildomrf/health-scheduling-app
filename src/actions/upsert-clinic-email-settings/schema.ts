import { z } from "zod";

export const upsertClinicEmailSettingsSchema = z.object({
  senderName: z
    .string()
    .min(1, "Nome do remetente é obrigatório")
    .max(100, "Nome muito longo"),
  senderEmail: z.string().email("Email inválido"),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor primária inválida")
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor secundária inválida")
    .optional(),
  footerText: z.string().max(500, "Texto do rodapé muito longo").optional(),
  clinicAddress: z.string().max(200, "Endereço muito longo").optional(),
  clinicPhone: z.string().max(20, "Telefone muito longo").optional(),
  clinicWebsite: z
    .string()
    .url("URL do site inválida")
    .optional()
    .or(z.literal("")),
  emailSignature: z.string().max(1000, "Assinatura muito longa").optional(),
  enableReminders: z.boolean().optional(),
  reminder24hEnabled: z.boolean().optional(),
  reminder2hEnabled: z.boolean().optional(),
});

export type UpsertClinicEmailSettingsSchema = z.infer<
  typeof upsertClinicEmailSettingsSchema
>;
