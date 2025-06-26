import { NextRequest, NextResponse } from "next/server";

import { autoArchiveConversations } from "@/actions/auto-archive-conversations";

export async function GET(request: NextRequest) {
  try {
    console.log("🤖 Cron job: Auto-archive conversations started");

    // Verificar se é um cron job legítimo (opcional - adicionar auth header)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("❌ Unauthorized cron job request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Executar o arquivamento automático
    const result = await autoArchiveConversations();

    if (result?.data) {
      console.log(
        `✅ Cron job completed: ${result.data.archivedCount} conversations archived`,
      );

      return NextResponse.json({
        success: true,
        message: `${result.data.archivedCount} conversations archived successfully`,
        archivedCount: result.data.archivedCount,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "No conversations to archive",
      archivedCount: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);

    return NextResponse.json(
      {
        error: "Failed to archive conversations",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
