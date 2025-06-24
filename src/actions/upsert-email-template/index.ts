"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { emailTemplatesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upsertEmailTemplateSchema } from "./schema";

export const upsertEmailTemplate = actionClient
  .schema(upsertEmailTemplateSchema)
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
      // Verificar se é edição ou criação
      let existingTemplate = null;
      if (parsedInput.id) {
        existingTemplate = await db.query.emailTemplatesTable.findFirst({
          where: eq(emailTemplatesTable.id, parsedInput.id),
        });

        if (
          existingTemplate &&
          existingTemplate.clinicId !== session.user.clinic.id
        ) {
          throw new Error("Template não encontrado");
        }
      }

      const templateData = {
        clinicId: session.user.clinic.id,
        name: parsedInput.name,
        type: parsedInput.type,
        subject: parsedInput.subject,
        htmlContent: parsedInput.htmlContent,
        textContent: parsedInput.textContent || null,
        variables: parsedInput.variables
          ? JSON.stringify(parsedInput.variables)
          : null,
        isActive: parsedInput.isActive ?? true,
        updatedAt: new Date(),
      };

      let result;

      if (existingTemplate) {
        // Atualizar template existente
        [result] = await db
          .update(emailTemplatesTable)
          .set(templateData)
          .where(eq(emailTemplatesTable.id, parsedInput.id!))
          .returning();
      } else {
        // Criar novo template
        [result] = await db
          .insert(emailTemplatesTable)
          .values({
            ...templateData,
            id: parsedInput.id,
          })
          .returning();
      }

      revalidatePath("/email-templates");

      return {
        success: true,
        data: result,
        message: existingTemplate
          ? "Template atualizado com sucesso"
          : "Template criado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      throw new Error("Erro interno do servidor");
    }
  });
