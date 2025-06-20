import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendCredentialsSchema = z.object({
  patientId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId } = sendCredentialsSchema.parse(body);

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

    // 5. Enviar email diretamente
    const emailResult = await sendEmail({
      to: patient.email,
      subject: "Suas credenciais de acesso - Dr. Cuidar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Dr. Cuidar</h1>
            <p style="color: #6b7280; margin: 5px 0;">Sistema de Agendamento Médico</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Olá, ${patient.name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Suas credenciais de acesso ao portal do paciente foram geradas com sucesso.
            </p>
            
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;"><strong>Email:</strong> ${patient.email}</p>
              <p style="margin: 10px 0 0 0; color: #374151;"><strong>Senha Temporária:</strong> <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
            </div>
            
            <p style="color: #dc2626; font-size: 14px; margin: 20px 0;">
              ⚠️ <strong>Importante:</strong> Esta é uma senha temporária. Recomendamos que você altere sua senha após o primeiro acesso.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/patient/login" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Acessar Portal do Paciente
              </a>
            </div>
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

    console.log("✅ Credenciais enviadas:", {
      email: patient.email,
      messageId: emailResult.messageId,
      previewUrl: emailResult.previewUrl,
    });

    if (emailResult.previewUrl) {
      console.log("🔗 Preview do email (credenciais):", emailResult.previewUrl);
    }

    return NextResponse.json({
      success: true,
      data: {
        email: patient.email,
        temporaryPassword,
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl,
        message: "Credenciais enviadas por email com sucesso!",
      },
    });
  } catch (error) {
    console.error("Erro ao enviar credenciais:", error);

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
