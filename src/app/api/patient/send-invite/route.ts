import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendInviteSchema = z.object({
  patientId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId } = sendInviteSchema.parse(body);

    // 1. Buscar dados do paciente
    const patientData = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.id, patientId))
      .limit(1);

    if (patientData.length === 0) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 },
      );
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
    const activationLink = `http://localhost:3000/patient/activate?token=${activationToken}`;

    // 6. Enviar email diretamente
    const emailResult = await sendEmail({
      to: patient.email,
      subject: "Convite para ativar sua conta - Dr. Cuidar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Dr. Cuidar</h1>
            <p style="color: #6b7280; margin: 5px 0;">Sistema de Agendamento Médico</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; margin-top: 0;">Olá, ${patient.name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Você foi convidado(a) a ativar sua conta no portal do paciente Dr. Cuidar.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Clique no botão abaixo para definir sua senha e ativar sua conta:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" 
                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Ativar Minha Conta
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                ⏰ <strong>Atenção:</strong> Este convite expira em <strong>7 dias</strong> (${expiresAt.toLocaleDateString("pt-BR")}).
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
              Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
            </p>
            <p style="color: #2563eb; font-size: 12px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${activationLink}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Este email foi enviado automaticamente. Não responda este email.
            </p>
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Erro ao enviar email" },
        { status: 500 },
      );
    }

    console.log("✅ Convite enviado:", {
      email: patient.email,
      messageId: emailResult.messageId,
      previewUrl: emailResult.previewUrl,
    });

    if (emailResult.previewUrl) {
      console.log("🔗 Preview do email (convite):", emailResult.previewUrl);
    }

    return NextResponse.json({
      success: true,
      data: {
        email: patient.email,
        activationLink,
        expiresAt,
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl,
        message: "Convite de ativação enviado por email com sucesso!",
      },
    });
  } catch (error) {
    console.error("Erro ao enviar convite:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
