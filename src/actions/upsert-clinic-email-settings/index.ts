"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { clinicEmailSettingsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upsertClinicEmailSettingsSchema } from "./schema";

export const upsertClinicEmailSettings = actionClient
  .schema(upsertClinicEmailSettingsSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Não autorizado");
    }

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    try {
      // Verificar se já existe configuração para esta clínica
      const existingSettings = await db.query.clinicEmailSettingsTable.findFirst({
        where: eq(clinicEmailSettingsTable.clinicId, session.user.clinic.id),
      });

      const settingsData = {
        clinicId: session.user.clinic.id,
        senderName: parsedInput.senderName,
        senderEmail: parsedInput.senderEmail,
        logoUrl: parsedInput.logoUrl || null,
        primaryColor: parsedInput.primaryColor || "#3B82F6",
        secondaryColor: parsedInput.secondaryColor || "#1F2937",
        footerText: parsedInput.footerText || null,
        clinicAddress: parsedInput.clinicAddress || null,
        clinicPhone: parsedInput.clinicPhone || null,
        clinicWebsite: parsedInput.clinicWebsite || null,
        emailSignature: parsedInput.emailSignature || null,
        enableReminders: parsedInput.enableReminders ?? true,
        reminder24hEnabled: parsedInput.reminder24hEnabled ?? true,
        reminder2hEnabled: parsedInput.reminder2hEnabled ?? true,
        updatedAt: new Date(),
      };

      let result;

      if (existingSettings) {
        // Atualizar configurações existentes
        [result] = await db
          .update(clinicEmailSettingsTable)
          .set(settingsData)
          .where(eq(clinicEmailSettingsTable.clinicId, session.user.clinic.id))
          .returning();
      } else {
        // Criar novas configurações
        [result] = await db
          .insert(clinicEmailSettingsTable)
          .values(settingsData)
          .returning();
      }

      revalidatePath("/email-settings");

      return {
        success: true,
        data: result,
        message: existingSettings 
          ? "Configurações atualizadas com sucesso" 
          : "Configurações criadas com sucesso",
      };
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw new Error("Erro interno do servidor");
    }
  }); 