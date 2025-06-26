import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import {
  chatConversationsTable,
  patientsTable,
  usersToClinicsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { ClinicChatList } from "./components/clinic-chat-list";

export default async function ClinicChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/authentication");
  }

  // Buscar a clínica do usuário
  const [userClinic] = await db
    .select()
    .from(usersToClinicsTable)
    .where(eq(usersToClinicsTable.userId, session.user.id))
    .limit(1);

  if (!userClinic) {
    redirect("/clinic-form");
  }

  // Buscar conversas da clínica com dados dos pacientes (simplificado)
  let conversations: Array<{
    id: string;
    subject: string;
    status: "active" | "resolved" | "archived";
    priority: number;
    lastMessageAt: Date;
    createdAt: Date;
    assignedUserId: string | null;
    patientId: string;
    patientName: string;
    patientEmail: string;
    unreadCount: number;
  }> = [];

  try {
    const conversationsData = await db
      .select({
        id: chatConversationsTable.id,
        subject: chatConversationsTable.subject,
        status: chatConversationsTable.status,
        priority: chatConversationsTable.priority,
        lastMessageAt: chatConversationsTable.lastMessageAt,
        createdAt: chatConversationsTable.createdAt,
        assignedUserId: chatConversationsTable.assignedUserId,

        // Dados do paciente
        patientId: patientsTable.id,
        patientName: patientsTable.name,
        patientEmail: patientsTable.email,
      })
      .from(chatConversationsTable)
      .leftJoin(
        patientsTable,
        eq(chatConversationsTable.patientId, patientsTable.id),
      )
      .where(eq(chatConversationsTable.clinicId, userClinic.clinicId))
      .orderBy(desc(chatConversationsTable.lastMessageAt));

    // Adicionar unreadCount temporariamente (depois será feito via JOIN com tabela chat_unread_messages)
    // Filtrar apenas conversas com dados completos do paciente
    conversations = Array.isArray(conversationsData)
      ? conversationsData
          .filter(
            (conv) => conv.patientId && conv.patientName && conv.patientEmail,
          )
          .map((conv) => ({
            ...conv,
            patientId: conv.patientId!,
            patientName: conv.patientName!,
            patientEmail: conv.patientEmail!,
            unreadCount: 0, // Temporário
          }))
      : [];
  } catch (error) {
    console.error("Error fetching clinic conversations:", error);
    conversations = [];
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chat com Pacientes
            </h1>
            <p className="text-gray-600">
              Gerencie conversas com os pacientes da clínica
            </p>
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Conversas Ativas
            </h2>
          </div>

          <ClinicChatList
            conversations={conversations}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </PageContainer>
  );
}
