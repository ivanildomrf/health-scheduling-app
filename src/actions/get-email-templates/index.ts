"use server";

import { db } from "@/db";
import { emailTemplatesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getEmailTemplates() {
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
    const templates = await db.query.emailTemplatesTable.findMany({
      where: eq(emailTemplatesTable.clinicId, session.user.clinic.id),
      orderBy: (templates, { desc }) => [desc(templates.createdAt)],
      with: {
        attachments: true,
      },
    });

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    throw new Error("Erro interno do servidor");
  }
}

export async function getEmailTemplateById(id: string) {
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
    const template = await db.query.emailTemplatesTable.findFirst({
      where: and(
        eq(emailTemplatesTable.id, id),
        eq(emailTemplatesTable.clinicId, session.user.clinic.id),
      ),
      with: {
        attachments: true,
      },
    });

    if (!template) {
      throw new Error("Template não encontrado");
    }

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Erro ao buscar template:", error);
    throw new Error("Erro interno do servidor");
  }
}

export async function getEmailTemplateByType(type: string) {
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
    const template = await db.query.emailTemplatesTable.findFirst({
      where: and(
        eq(emailTemplatesTable.type, type as any),
        eq(emailTemplatesTable.clinicId, session.user.clinic.id),
      ),
      with: {
        attachments: true,
      },
    });

    return {
      success: true,
      data: template || null,
    };
  } catch (error) {
    console.error("Erro ao buscar template por tipo:", error);
    throw new Error("Erro interno do servidor");
  }
}
