import { NextRequest, NextResponse } from "next/server";

import { autoArchiveConversations } from "@/actions/auto-archive-conversations";
import { type ChatConversation } from "@/db/types";

interface ArchiveConversationsResponse {
  success: boolean;
  message: string;
  archivedCount: number;
  timestamp: string;
  conversations?: ChatConversation[];
}

interface ArchiveConversationsErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verificar se é um cron job legítimo (opcional - adicionar auth header)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Executar o arquivamento automático
    const result = await autoArchiveConversations();

    // Se não houver erros de validação e tivermos dados
    if (!result.validationErrors && result.data?.data) {
      const { archivedCount, conversations } = result.data.data;

      const response: ArchiveConversationsResponse = {
        success: true,
        message: `${archivedCount} conversations archived successfully`,
        archivedCount,
        conversations,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    }

    const emptyResponse: ArchiveConversationsResponse = {
      success: true,
      message: "No conversations to archive",
      archivedCount: 0,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(emptyResponse);
  } catch (error) {
    const errorResponse: ArchiveConversationsErrorResponse = {
      error: "Failed to archive conversations",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
