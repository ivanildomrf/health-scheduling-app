import { z } from "zod";

export const invitePatientSchema = z.object({
  // Dados básicos obrigatórios
  name: z.string().min(1, "Nome é obrigatório"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido"),

  // Dados opcionais para cadastro completo
  socialName: z.string().optional(),
  phone: z.string().optional(),
  sex: z.enum(["male", "female"]).optional(),
  birthDate: z.string().optional(),

  // Tipo de convite
  inviteType: z.enum(["quick", "complete"]), // quick = só convite, complete = cadastro completo

  // Senha temporária (apenas para cadastro completo)
  temporaryPassword: z.string().optional(),
});

export type InvitePatientData = z.infer<typeof invitePatientSchema>;
