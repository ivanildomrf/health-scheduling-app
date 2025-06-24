import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

const sendInviteSchema = z.object({
  patientId: z.string().uuid(),
});

export const sendPatientInvite = actionClient
  .schema(sendInviteSchema)
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

      // 2. Gerar token de ativação único
      const activationToken = randomUUID();

      // 3. Definir data de expiração (7 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // 4. Atualizar paciente com token de ativação
      await db
        .update(patientsTable)
        .set({
          activationToken,
          activationTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, patientId));

      // 5. Criar link de ativação
      const activationLink = `${process.env.NEXT_PUBLIC_APP_URL}/patient/activate?token=${activationToken}`;

      // 6. Enviar email via API route
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/send-email/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientName: patient.name,
            email: patient.email,
            activationUrl: activationLink,
            expiresAt: expiresAt.toISOString(),
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
          activationLink,
          expiresAt,
          messageId: emailResult.messageId,
          previewUrl: emailResult.previewUrl,
          message: "Convite de ativação enviado por email com sucesso!",
        },
      };
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      return {
        success: false,
        error: "Erro interno do servidor",
      };
    }
  });
