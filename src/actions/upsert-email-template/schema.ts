import { z } from "zod";

export const upsertEmailTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  type: z.enum([
    "appointment_reminder_24h",
    "appointment_reminder_2h",
    "appointment_confirmed",
    "appointment_cancelled",
    "appointment_completed",
    "welcome_patient",
    "welcome_professional",
    "password_reset",
    "custom",
  ]),
  subject: z
    .string()
    .min(1, "Assunto é obrigatório")
    .max(200, "Assunto muito longo"),
  htmlContent: z.string().min(1, "Conteúdo HTML é obrigatório"),
  textContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type UpsertEmailTemplateSchema = z.infer<
  typeof upsertEmailTemplateSchema
>;
