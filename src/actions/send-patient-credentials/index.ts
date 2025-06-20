import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

const sendCredentialsSchema = z.object({
  patientId: z.string().uuid(),
});

export const sendPatientCredentials = actionClient
  .schema(sendCredentialsSchema)
  .action(async ({ parsedInput: { patientId } }) => {
    try {
      // 1. Buscar dados do paciente
      const patientData = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.id, patientId))
        .limit(1);

      if (patientData.length === 0) {
        return {
          success: false,
          error: "Paciente não encontrado",
        };
      }

      const patient = patientData[0];

      // 2. Gerar senha temporária (8 caracteres alfanuméricos)
      const temporaryPassword = Math.random()
        .toString(36)
        .slice(-8)
        .toUpperCase();

      // 3. Hash da senha temporária
      const hashedPassword = await hash(temporaryPassword, 12);

      // 4. Atualizar paciente com nova senha
      await db
        .update(patientsTable)
        .set({
          password: hashedPassword,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, patientId));

      // 5. Enviar email via API route
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/send-email/credentials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientName: patient.name,
            email: patient.email,
            temporaryPassword,
          }),
        },
      );

      const emailResult = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `Erro ao enviar email: ${emailResult.error}`,
        };
      }

      return {
        success: true,
        data: {
          email: patient.email,
          temporaryPassword,
          messageId: emailResult.messageId,
          previewUrl: emailResult.previewUrl,
          message: "Credenciais enviadas por email com sucesso!",
        },
      };
    } catch (error) {
      console.error("Erro ao enviar credenciais:", error);
      return {
        success: false,
        error: "Erro interno do servidor",
      };
    }
  });
