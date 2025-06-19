"use server";

import { patientAuth } from "@/lib/patient-auth";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updatePatientProfileSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
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
    const { patientId, ...updateData } = parsedInput;

    try {
      const success = await patientAuth.updateProfile(patientId, updateData);

      if (!success) {
        return {
          success: false,
          error: "Erro ao atualizar perfil",
        };
      }

      revalidatePath("/patient/profile");

      return {
        success: true,
        message: "Perfil atualizado com sucesso",
      };
    } catch (error) {
      throw new Error("Erro ao atualizar perfil do paciente");
    }
  });
