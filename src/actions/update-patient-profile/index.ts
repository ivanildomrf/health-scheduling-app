"use server";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";
import { actionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updatePatientProfileSchema = z.object({
  patientId: z.string().uuid(),
  // Dados básicos obrigatórios do CNS
  name: z.string().min(1, "Nome é obrigatório"),
  socialName: z.string().optional(),
  motherName: z.string().optional(),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  birthDate: z.string().optional(),
  raceColor: z
    .enum(["branca", "preta", "parda", "amarela", "indigena", "sem_informacao"])
    .optional(),

  // Contato
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido"),
  phone: z.string().min(1, "Telefone é obrigatório"),

  // Endereço
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),

  // Documentos
  cpf: z.string().optional(),
  cnsNumber: z.string().optional(),

  // Contato de emergência
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

export const updatePatientProfile = actionClient
  .schema(updatePatientProfileSchema)
  .action(async ({ parsedInput }) => {
    const session = await getPatientSession();

    if (!session) {
      throw new Error("Não autorizado");
    }

    // Verificar se o paciente está tentando atualizar o próprio perfil
    if (session.patientId !== parsedInput.patientId) {
      throw new Error("Não autorizado");
    }

    // Verificar se o email já está sendo usado por outro paciente
    if (parsedInput.email) {
      const existingPatient = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.email, parsedInput.email))
        .limit(1);

      if (
        existingPatient.length > 0 &&
        existingPatient[0].id !== parsedInput.patientId
      ) {
        return {
          success: false,
          error: "Este email já está sendo usado por outro paciente",
        };
      }
    }

    try {
      // Atualizar o perfil do paciente
      await db
        .update(patientsTable)
        .set({
          name: parsedInput.name,
          socialName: parsedInput.socialName || null,
          motherName: parsedInput.motherName || null,
          sex: parsedInput.sex,
          birthDate: parsedInput.birthDate
            ? new Date(parsedInput.birthDate)
            : null,
          raceColor: parsedInput.raceColor || null,
          email: parsedInput.email,
          phone: parsedInput.phone,
          city: parsedInput.city || null,
          state: parsedInput.state || null,
          zipCode: parsedInput.zipCode || null,
          cpf: parsedInput.cpf || null,
          cnsNumber: parsedInput.cnsNumber || null,
          emergencyContact: parsedInput.emergencyContact || null,
          emergencyPhone: parsedInput.emergencyPhone || null,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, parsedInput.patientId));

      revalidatePath("/patient/profile");
      revalidatePath("/patient/dashboard");

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Erro ao atualizar perfil",
      };
    }
  });
