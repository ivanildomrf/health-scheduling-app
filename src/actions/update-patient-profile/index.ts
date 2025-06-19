"use server";

import { patientAuth } from "@/lib/patient-auth";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updatePatientProfileSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  socialName: z.string().optional(),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido (exemplo: usuario@email.com)")
    .refine((email) => email.includes("@") && email.includes("."), {
      message: "Email deve conter @ e um domínio válido",
    }),
  phone: z.string().min(1, "Telefone é obrigatório"),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  cpf: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

export const updatePatientProfile = actionClient
  .schema(updatePatientProfileSchema)
  .action(async ({ parsedInput }) => {
    const { patientId, email, ...updateData } = parsedInput;

    try {
      // Verificar se o email já está sendo usado por outro paciente
      if (email) {
        const success = await patientAuth.updateProfile(patientId, {
          email,
          ...updateData,
        });

        if (!success) {
          return {
            success: false,
            error: "Erro ao atualizar perfil",
          };
        }
      } else {
        const success = await patientAuth.updateProfile(patientId, updateData);

        if (!success) {
          return {
            success: false,
            error: "Erro ao atualizar perfil",
          };
        }
      }

      revalidatePath("/patient/profile");
      revalidatePath("/patient/dashboard");

      return {
        success: true,
        message: "Perfil atualizado com sucesso",
      };
    } catch (error) {
      // Verificar se é erro de email duplicado
      if (error instanceof Error && error.message.includes("email")) {
        return {
          success: false,
          error: "Este email já está sendo usado por outro paciente",
        };
      }

      throw new Error("Erro ao atualizar perfil do paciente");
    }
  });
