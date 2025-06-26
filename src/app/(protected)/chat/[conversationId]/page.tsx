import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import {
  chatConversationsTable,
  patientsTable,
  usersToClinicsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { ClinicChatWindow } from "./components/clinic-chat-window";

interface ClinicChatConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ClinicChatConversationPage({
  params,
}: ClinicChatConversationPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authentication");
  }

  const { conversationId } = await params;

  // Buscar a clínica do usuário
  const [userClinic] = await db
    .select()
    .from(usersToClinicsTable)
    .where(eq(usersToClinicsTable.userId, session.user.id))
    .limit(1);

  if (!userClinic) {
    redirect("/clinic-form");
  }

  // Buscar dados da conversa com informações do paciente
  const [conversationData] = await db
    .select({
      id: chatConversationsTable.id,
      subject: chatConversationsTable.subject,
      status: chatConversationsTable.status,
      priority: chatConversationsTable.priority,
      lastMessageAt: chatConversationsTable.lastMessageAt,
      createdAt: chatConversationsTable.createdAt,
      patientId: patientsTable.id,
      patientName: patientsTable.name,
      patientEmail: patientsTable.email,
    })
    .from(chatConversationsTable)
    .leftJoin(
      patientsTable,
      eq(chatConversationsTable.patientId, patientsTable.id),
    )
    .where(eq(chatConversationsTable.id, conversationId))
    .limit(1);

  if (!conversationData || !conversationData.patientId) {
    notFound();
  }

  // Verificar se a conversa pertence à clínica do usuário
  if (conversationData.patientId) {
    const [patient] = await db
      .select({ clinicId: patientsTable.clinicId })
      .from(patientsTable)
      .where(eq(patientsTable.id, conversationData.patientId))
      .limit(1);

    if (!patient || patient.clinicId !== userClinic.clinicId) {
      notFound();
    }
  }

  const conversation = {
    id: conversationData.id,
    subject: conversationData.subject,
    status: conversationData.status,
    priority: conversationData.priority,
    lastMessageAt: conversationData.lastMessageAt,
    createdAt: conversationData.createdAt,
    patientId: conversationData.patientId!,
    patientName: conversationData.patientName!,
    patientEmail: conversationData.patientEmail!,
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chat com {conversation.patientName}
            </h1>
            <p className="text-gray-600">{conversation.subject}</p>
          </div>
        </div>

        {/* Chat Window */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <ClinicChatWindow
            conversation={conversation}
            userName={session.user.name || "Recepcionista"}
          />
        </div>
      </div>
    </PageContainer>
  );
}
