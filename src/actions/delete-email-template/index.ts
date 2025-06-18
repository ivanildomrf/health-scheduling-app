"use server";

import { db } from "@/db";
import { emailTemplatesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const deleteEmailTemplateSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const deleteEmailTemplate = actionClient
  .schema(deleteEmailTemplateSchema)
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
      // Verificar se o template existe e pertence à clínica
      const existingTemplate = await db.query.emailTemplatesTable.findFirst({
        where: and(
          eq(emailTemplatesTable.id, parsedInput.id),
          eq(emailTemplatesTable.clinicId, session.user.clinic.id),
        ),
      });

      if (!existingTemplate) {
        throw new Error("Template não encontrado");
      }

      // Deletar o template
      await db
        .delete(emailTemplatesTable)
        .where(
          and(
            eq(emailTemplatesTable.id, parsedInput.id),
            eq(emailTemplatesTable.clinicId, session.user.clinic.id),
          ),
        );

      revalidatePath("/email-templates");

      return {
        success: true,
        message: "Template excluído com sucesso",
      };
    } catch (error) {
      console.error("Erro ao excluir template:", error);
      throw new Error("Erro interno do servidor");
    }
  });
