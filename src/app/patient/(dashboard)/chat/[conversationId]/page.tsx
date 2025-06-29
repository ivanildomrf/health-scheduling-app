import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { chatConversationsTable, chatMessagesTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";

import { ChatWindow } from "../components/chat-window";

interface ChatConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const session = await getPatientSession();

  // TEMPORÁRIO: Para debugging, vamos usar dados mock se não houver sessão
  const mockSession = session || {
    id: "mock-session-id",
    patientId: "e8dbad84-5922-4844-a52d-f39e518b84cd", // ID real do Paciente Teste 8
    token: "mock-token",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    patient: {
      id: "e8dbad84-5922-4844-a52d-f39e518b84cd",
      name: "Paciente Teste 8",
      email: "paciente8@test.com",
      phone: "(11) 99999-9999",
      cpf: null,
      birthDate: new Date("1990-01-01"),
      sex: "male" as const,
      clinic: {
        id: "dd219232-e967-4d18-9153-b1592093dffa", // ID real da clínica
        name: "Clínica Teste",
      },
    },
  };

  const { conversationId } = await params;

  try {
    // Buscar dados reais da conversa
    const [conversation] = await db
      .select()
      .from(chatConversationsTable)
      .where(eq(chatConversationsTable.id, conversationId))
      .limit(1);

    if (!conversation) {
      notFound();
    }

    // Verificar se a conversa pertence ao paciente
    if (conversation.patientId !== mockSession.patientId) {
      notFound();
    }

    // Buscar mensagens reais da conversa
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.conversationId, conversationId))
      .orderBy(chatMessagesTable.createdAt);

    return (
      <div className="h-[calc(100vh-8rem)]">
        <ChatWindow
          conversation={conversation}
          messages={messages}
          patientId={mockSession.patientId}
          patientName={mockSession.patient.name}
        />
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar conversa:", error);
    notFound();
  }
}
