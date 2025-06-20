import { emailTemplates, sendEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const credentialsSchema = z.object({
  patientName: z.string(),
  email: z.string().email(),
  temporaryPassword: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientName, email, temporaryPassword } =
      credentialsSchema.parse(body);

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/patient/login`;
    const clinicName = "Clínica Cividini"; // TODO: Buscar do banco de dados

    const emailTemplate = emailTemplates.patientCredentials({
      patientName,
      email,
      temporaryPassword,
      loginUrl,
      clinicName,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error) {
    console.error("Erro ao enviar email de credenciais:", error);

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
