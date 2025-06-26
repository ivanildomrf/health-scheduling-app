import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatConversationsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";

import { ChatConversationsList } from "./components/chat-conversations-list";
import { NewConversationButton } from "./components/new-conversation-button";

// Desabilitar cache para sempre buscar dados frescos
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PatientChatPage() {
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

  try {
    // Buscar conversas reais do banco de dados
    const conversations = await db
      .select()
      .from(chatConversationsTable)
      .where(eq(chatConversationsTable.patientId, mockSession.patientId))
      .orderBy(desc(chatConversationsTable.lastMessageAt));

    console.log(
      `📋 Conversas carregadas para paciente: ${conversations.length}`,
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <p className="text-gray-600">Converse com a equipe da clínica</p>
          </div>
          <NewConversationButton patientId={mockSession.patientId} />
        </div>

        {/* Lista de conversas */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Suas Conversas ({conversations.length})
            </h2>
          </div>

          <ChatConversationsList
            conversations={conversations.map((conv) => ({
              ...conv,
              unreadCount: 0, // TODO: Implementar contagem de não lidas
            }))}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar conversas:", error);

    // Fallback para dados mock em caso de erro
    const conversations = [
      {
        id: "error-fallback",
        subject: "Erro ao carregar conversas",
        status: "active" as const,
        priority: 1,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        unreadCount: 0,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <p className="text-gray-600">Converse com a equipe da clínica</p>
          </div>
          <NewConversationButton patientId={mockSession.patientId} />
        </div>

        {/* Lista de conversas */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Erro ao Carregar Conversas
            </h2>
          </div>

          <div className="p-4 text-center text-gray-500">
            Não foi possível carregar suas conversas. Tente novamente.
          </div>
        </div>
      </div>
    );
  }
}
