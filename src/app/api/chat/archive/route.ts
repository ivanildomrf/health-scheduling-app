import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { archiveConversation } from "@/actions/archive-conversation";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, reason } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "ID da conversa é obrigatório" },
        { status: 400 },
      );
    }

    const result = await archiveConversation({
      conversationId,
      reason: reason || "Encerrada manualmente pela clínica",
      userId: session.user.id,
    });

    // next-safe-action retorna { data, serverError, validationErrors }
    if (result.serverError) {
      return NextResponse.json({ error: result.serverError }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "Erro ao arquivar conversa" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
