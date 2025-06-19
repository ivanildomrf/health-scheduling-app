import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!session.user.clinic?.id) {
      return NextResponse.json(
        { error: "Clínica não encontrada" },
        { status: 404 },
      );
    }

    const professionals = await db.query.professionalsTable.findMany({
      where: eq(professionalsTable.clinicId, session.user.clinic.id),
    });

    return NextResponse.json(professionals);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
