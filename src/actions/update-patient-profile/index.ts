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
  motherUnknown: z.boolean().optional(),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  gender: z
    .enum(["cisgender", "transgenero", "nao_binario", "outro", "nao_informado"])
    .optional(),
  birthDate: z.string().optional(),
  raceColor: z
    .enum(["branca", "preta", "parda", "amarela", "indigena", "sem_informacao"])
    .optional(),

  // Dados de nacionalidade
  nationality: z.string().optional(),
  birthCountry: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  naturalizationDate: z.string().optional(),

  // Documentos para estrangeiros
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),

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

  // Documentos brasileiros
  cpf: z.string().optional(),
  rgNumber: z.string().optional(),
  rgComplement: z.string().optional(),
  rgState: z.string().optional(),
  rgIssuer: z.string().optional(),
  rgIssueDate: z.string().optional(),
  cnsNumber: z.string().optional(),

  // Guardião/Representante legal (para menores de 16 anos)
  guardianName: z.string().optional(),
  guardianRelationship: z
    .enum([
      "pai",
      "mae",
      "avo",
      "avo_feminino",
      "tio",
      "tia",
      "irmao",
      "irma",
      "tutor",
      "curador",
      "responsavel_legal",
      "outro",
    ])
    .optional(),
  guardianCpf: z.string().optional(),

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

    // Verificar se o CPF já está sendo usado por outro paciente
    if (parsedInput.cpf && parsedInput.cpf.trim() !== "") {
      const existingPatientByCpf = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.cpf, parsedInput.cpf.trim()))
        .limit(1);

      if (
        existingPatientByCpf.length > 0 &&
        existingPatientByCpf[0].id !== parsedInput.patientId
      ) {
        return {
          success: false,
          error: "Este CPF já está sendo usado por outro paciente",
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
          motherUnknown: parsedInput.motherUnknown || false,
          sex: parsedInput.sex as "male" | "female",
          gender: parsedInput.gender as
            | "cisgender"
            | "transgenero"
            | "nao_binario"
            | "outro"
            | "nao_informado"
            | null,
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
          nationality: parsedInput.nationality || null,
          birthCountry: parsedInput.birthCountry || null,
          birthCity: parsedInput.birthCity || null,
          birthState: parsedInput.birthState || null,
          naturalizationDate: parsedInput.naturalizationDate
            ? new Date(parsedInput.naturalizationDate)
            : null,
          passportNumber: parsedInput.passportNumber || null,
          passportCountry: parsedInput.passportCountry || null,
          passportIssueDate: parsedInput.passportIssueDate
            ? new Date(parsedInput.passportIssueDate)
            : null,
          passportExpiryDate: parsedInput.passportExpiryDate
            ? new Date(parsedInput.passportExpiryDate)
            : null,
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
          rgNumber: parsedInput.rgNumber || null,
          rgComplement: parsedInput.rgComplement || null,
          rgState: parsedInput.rgState || null,
          rgIssuer: parsedInput.rgIssuer || null,
          rgIssueDate: parsedInput.rgIssueDate
            ? new Date(parsedInput.rgIssueDate)
            : null,
          cnsNumber: parsedInput.cnsNumber || null,
          guardianName: parsedInput.guardianName || null,
          guardianRelationship: parsedInput.guardianRelationship as
            | "pai"
            | "mae"
            | "avo"
            | "avo_feminino"
            | "tio"
            | "tia"
            | "irmao"
            | "irma"
            | "tutor"
            | "curador"
            | "responsavel_legal"
            | "outro"
            | null,
          guardianCpf: parsedInput.guardianCpf || null,
          emergencyContact: parsedInput.emergencyContact || null,
          emergencyPhone: parsedInput.emergencyPhone || null,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, parsedInput.patientId));

      revalidatePath("/patient/profile");
      revalidatePath("/patient/dashboard");

      return { success: true };
    } catch (error: any) {
      console.error("❌ Erro ao atualizar perfil:", error);

      // Verificar se o erro é de CPF duplicado
      if (error?.cause?.constraint === "patients_cpf_unique") {
        return {
          success: false,
          error: "Este CPF já está sendo usado por outro paciente",
        };
      }

      // Verificar se o erro é de email duplicado
      if (error?.cause?.constraint === "patients_email_unique") {
        return {
          success: false,
          error: "Este email já está sendo usado por outro paciente",
        };
      }

      return {
        success: false,
        error: "Erro ao atualizar perfil",
      };
    }
  });
