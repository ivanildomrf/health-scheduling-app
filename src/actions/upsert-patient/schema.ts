import { z } from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(1, { message: "Telefone é obrigatório" }),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
