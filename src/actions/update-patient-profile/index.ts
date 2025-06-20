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

  // Endereço completo
  zipCode: z.string().optional(),
  addressType: z
    .enum([
      "rua",
      "avenida",
      "travessa",
      "alameda",
      "praca",
      "estrada",
      "rodovia",
      "outro",
    ])
    .optional(),
  addressName: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

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
          sex: parsedInput.sex as "male" | "female",
          birthDate: parsedInput.birthDate
            ? new Date(parsedInput.birthDate)
            : null,
          raceColor: parsedInput.raceColor as
            | "branca"
            | "preta"
            | "parda"
            | "amarela"
            | "indigena"
            | "sem_informacao"
            | null,
          email: parsedInput.email,
          phone: parsedInput.phone,
          zipCode: parsedInput.zipCode || null,
          addressType: parsedInput.addressType as
            | "rua"
            | "avenida"
            | "travessa"
            | "alameda"
            | "praca"
            | "estrada"
            | "rodovia"
            | "outro"
            | null,
          addressName: parsedInput.addressName || null,
          addressNumber: parsedInput.addressNumber || null,
          addressComplement: parsedInput.addressComplement || null,
          addressNeighborhood: parsedInput.addressNeighborhood || null,
          city: parsedInput.city || null,
          state: parsedInput.state || null,
          country: parsedInput.country || null,
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
