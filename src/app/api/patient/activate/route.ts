import { hash } from "bcryptjs";
import { and, eq, gt, isNotNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";

const activateSchema = z.object({
  patientId: z.string().uuid(),
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, token, password } = activateSchema.parse(body);

    // Verificar se o token é válido e não expirou
    const patient = await db
      .select()
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.id, patientId),
          eq(patientsTable.activationToken, token),
          isNotNull(patientsTable.activationTokenExpiresAt),
          gt(patientsTable.activationTokenExpiresAt, new Date()),
        ),
      )
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 },
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 12);

    // Atualizar paciente: definir senha, limpar token, ativar conta
    await db
      .update(patientsTable)
      .set({
        password: hashedPassword,
        activationToken: null,
        activationTokenExpiresAt: null,
        isActive: true,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(patientsTable.id, patientId));

    return NextResponse.json({
      success: true,
      message: "Conta ativada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao ativar conta:", error);

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
