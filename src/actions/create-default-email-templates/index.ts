"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { emailTemplatesTable, emailTemplateTypeEnum } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

type EmailTemplateType = (typeof emailTemplateTypeEnum.enumValues)[number];

const DEFAULT_TEMPLATES: Record<
  EmailTemplateType,
  {
    name: string;
    subject: string;
    htmlContent: string;
  }
> = {
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

  appointment_cancelled: {
    name: "Consulta Cancelada - Padrão",
    subject: "{{clinicName}} - Consulta Cancelada",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .appointment-card { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .cancelled { color: #dc2626; font-weight: bold; }
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
        <p class="cancelled">❌ Sua consulta foi cancelada</p>
        <div class="appointment-card">
            <h3>Detalhes da Consulta Cancelada</h3>
            <p><strong>Profissional:</strong> {{professionalName}} - {{professionalSpecialty}}</p>
            <p><strong>Data:</strong> {{appointmentDate}}</p>
            <p><strong>Horário:</strong> {{appointmentTime}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{newAppointmentUrl}}" class="button">Agendar Nova Consulta</a>
        </div>
        <p>Se você tiver alguma dúvida, entre em contato conosco:</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },

  appointment_completed: {
    name: "Consulta Concluída - Padrão",
    subject: "{{clinicName}} - Consulta Concluída",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .appointment-card { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .completed { color: #16a34a; font-weight: bold; }
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
        <p class="completed">✅ Sua consulta foi concluída</p>
        <div class="appointment-card">
            <h3>Detalhes da Consulta</h3>
            <p><strong>Profissional:</strong> {{professionalName}} - {{professionalSpecialty}}</p>
            <p><strong>Data:</strong> {{appointmentDate}}</p>
            <p><strong>Horário:</strong> {{appointmentTime}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{newAppointmentUrl}}" class="button">Agendar Nova Consulta</a>
        </div>
        <p>Obrigado por confiar em nossos serviços!</p>
        <p>Se você tiver alguma dúvida, entre em contato conosco:</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },

  welcome_patient: {
    name: "Boas-vindas ao Paciente - Padrão",
    subject: "{{clinicName}} - Bem-vindo(a)!",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .welcome-card { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px; }
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
        <p>Seja bem-vindo(a) à {{clinicName}}! 🎉</p>
        <div class="welcome-card">
            <h3>Próximos Passos</h3>
            <p>1. Complete seu cadastro</p>
            <p>2. Agende sua primeira consulta</p>
            <p>3. Receba lembretes e confirmações por email</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{portalUrl}}" class="button">Acessar Portal do Paciente</a>
        </div>
        <p><strong>Endereço:</strong><br>{{clinicAddress}}</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
        <p><strong>Site:</strong> {{clinicWebsite}}</p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },

  welcome_professional: {
    name: "Boas-vindas ao Profissional - Padrão",
    subject: "{{clinicName}} - Bem-vindo(a) à equipe!",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .welcome-card { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: {{primaryColor}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: {{primaryColor}};">{{clinicName}}</h1>
    </div>
    <div class="content">
        <h2>Olá, {{professionalName}}!</h2>
        <p>Seja bem-vindo(a) à equipe da {{clinicName}}! 🎉</p>
        <div class="welcome-card">
            <h3>Próximos Passos</h3>
            <p>1. Complete seu cadastro</p>
            <p>2. Configure sua agenda</p>
            <p>3. Comece a atender</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{portalUrl}}" class="button">Acessar Sistema</a>
        </div>
        <p><strong>Endereço:</strong><br>{{clinicAddress}}</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
        <p><strong>Site:</strong> {{clinicWebsite}}</p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },

  password_reset: {
    name: "Redefinição de Senha - Padrão",
    subject: "{{clinicName}} - Redefinição de Senha",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .reset-card { background: #f3f4f6; border-left: 4px solid #4b5563; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: {{primaryColor}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; font-size: 14px; color: #666; }
        .warning { color: #dc2626; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: {{primaryColor}};">{{clinicName}}</h1>
    </div>
    <div class="content">
        <h2>Olá!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <div class="reset-card">
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Redefinir Senha</a>
            </div>
            <p class="warning">Este link é válido por 24 horas.</p>
            <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
        </div>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`,
  },

  custom: {
    name: "Template Personalizado",
    subject: "{{clinicName}} - {{subject}}",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid {{primaryColor}}; margin-bottom: 30px; }
        .content-card { background: #f8f9fa; border-left: 4px solid {{primaryColor}}; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: {{primaryColor}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: {{primaryColor}};">{{clinicName}}</h1>
    </div>
    <div class="content">
        {{content}}
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
          where: eq(emailTemplatesTable.type, type as EmailTemplateType),
        });

        if (existingTemplate) continue;

        const template =
          DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES];

        const [newTemplate] = await db
          .insert(emailTemplatesTable)
          .values({
            clinicId: session.user.clinic.id,
            name: template.name,
            type: type as EmailTemplateType,
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
