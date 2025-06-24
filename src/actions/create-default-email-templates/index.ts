"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { emailTemplatesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

const DEFAULT_TEMPLATES = {
  appointment_reminder_24h: {
    name: "Lembrete 24h - Padrão",
    subject: "{{clinicName}} - Lembrete: Consulta amanhã",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .appointment-card { background: #f8f9fa; border-left: 4px solid {{primaryColor}}; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: {{primaryColor}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: {{primaryColor}};">{{clinicName}}</h1>
    </div>
    <div class="content">
        <h2>Olá, {{patientName}}!</h2>
        <p>Este é um lembrete sobre sua consulta agendada para <strong>amanhã</strong>:</p>
        <div class="appointment-card">
            <h3>Detalhes da Consulta</h3>
            <p><strong>Profissional:</strong> {{professionalName}} - {{professionalSpecialty}}</p>
            <p><strong>Data:</strong> {{appointmentDate}}</p>
            <p><strong>Horário:</strong> {{appointmentTime}}</p>
            <p><strong>Duração:</strong> {{appointmentDuration}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmationUrl}}" class="button">Confirmar Consulta</a>
            <a href="{{rescheduleUrl}}" class="button" style="background: #6b7280;">Reagendar</a>
        </div>
        <p><strong>Endereço:</strong><br>{{clinicAddress}}</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },

  appointment_reminder_2h: {
    name: "Lembrete 2h - Padrão",
    subject: "{{clinicName}} - Lembrete: Consulta em 2 horas",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .appointment-card { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: {{primaryColor}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; font-size: 14px; color: #666; }
        .urgent { color: #f59e0b; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: {{primaryColor}};">{{clinicName}}</h1>
    </div>
    <div class="content">
        <h2>Olá, {{patientName}}!</h2>
        <p class="urgent">⏰ Sua consulta é em 2 horas!</p>
        <div class="appointment-card">
            <h3>Detalhes da Consulta</h3>
            <p><strong>Profissional:</strong> {{professionalName}} - {{professionalSpecialty}}</p>
            <p><strong>Data:</strong> {{appointmentDate}}</p>
            <p><strong>Horário:</strong> {{appointmentTime}}</p>
            <p><strong>Duração:</strong> {{appointmentDuration}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmationUrl}}" class="button">Confirmar Presença</a>
        </div>
        <p><strong>Endereço:</strong><br>{{clinicAddress}}</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
        <p><em>Recomendamos chegar 15 minutos antes do horário agendado.</em></p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },

  appointment_confirmed: {
    name: "Consulta Confirmada - Padrão",
    subject: "{{clinicName}} - Consulta Confirmada",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .appointment-card { background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .success { color: #16a34a; font-weight: bold; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: {{primaryColor}};">{{clinicName}}</h1>
    </div>
    <div class="content">
        <h2>Olá, {{patientName}}!</h2>
        <p class="success">✅ Sua consulta foi confirmada com sucesso!</p>
        <div class="appointment-card">
            <h3>Detalhes da Consulta</h3>
            <p><strong>Profissional:</strong> {{professionalName}} - {{professionalSpecialty}}</p>
            <p><strong>Data:</strong> {{appointmentDate}}</p>
            <p><strong>Horário:</strong> {{appointmentTime}}</p>
            <p><strong>Duração:</strong> {{appointmentDuration}}</p>
        </div>
        <p><strong>Endereço:</strong><br>{{clinicAddress}}</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
        <p>Aguardamos você no horário agendado. Caso precise alterar ou cancelar, entre em contato conosco.</p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },
};

const createDefaultEmailTemplatesSchema = z.object({
  templateTypes: z.array(z.string()).optional(),
});

export const createDefaultEmailTemplates = actionClient
  .schema(createDefaultEmailTemplatesSchema)
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
      const templateTypes =
        parsedInput.templateTypes || Object.keys(DEFAULT_TEMPLATES);
      const createdTemplates = [];

      for (const type of templateTypes) {
        if (!(type in DEFAULT_TEMPLATES)) continue;

        // Verificar se já existe template deste tipo
        const existingTemplate = await db.query.emailTemplatesTable.findFirst({
          where: eq(emailTemplatesTable.type, type as any),
        });

        if (existingTemplate) continue;

        const template =
          DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES];

        const [newTemplate] = await db
          .insert(emailTemplatesTable)
          .values({
            clinicId: session.user.clinic.id,
            name: template.name,
            type: type as any,
            subject: template.subject,
            htmlContent: template.htmlContent,
            isActive: true,
            isDefault: true,
          })
          .returning();

        createdTemplates.push(newTemplate);
      }

      return {
        success: true,
        data: createdTemplates,
        message: `${createdTemplates.length} templates padrão criados com sucesso`,
      };
    } catch (error) {
      console.error("Erro ao criar templates padrão:", error);
      throw new Error("Erro interno do servidor");
    }
  });
