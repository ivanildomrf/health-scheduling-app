import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { archiveConversation } from "@/actions/archive-conversation";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Archive Conversation START ===");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, reason } = body;

    console.log("📋 Dados recebidos:", { conversationId, reason });

    if (!conversationId) {
      console.log("❌ ID da conversa não fornecido");
      return NextResponse.json(
        { error: "ID da conversa é obrigatório" },
        { status: 400 },
      );
    }

    // Chamar a Server Action
    console.log("🔄 Chamando Server Action...");
    const result = await archiveConversation({
      conversationId,
      reason: reason || "Encerrada manualmente pela clínica",
      userId: session.user.id,
    });

    console.log("📊 Resultado da Server Action:", result);

    // next-safe-action retorna { data, serverError, validationErrors }
    if (result.serverError) {
      console.log("❌ Erro na Server Action:", result.serverError);
      return NextResponse.json({ error: result.serverError }, { status: 500 });
    }

    if (!result.data) {
      console.log("❌ Dados não retornados pela Server Action");
      return NextResponse.json(
        { error: "Erro ao arquivar conversa" },
        { status: 500 },
      );
    }

    console.log("✅ Conversa arquivada com sucesso");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erro na API de arquivamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
