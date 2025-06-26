import { ChatConversationsList } from "../components/chat-conversations-list";

export default function TestChatPage() {
  // Dados mock diretos
  const mockConversations = [
    {
      id: "test-conv-1",
      subject: "Conversa de Teste Direta",
      status: "active" as const,
      priority: 2,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      unreadCount: 1,
    },
    {
      id: "test-conv-2",
      subject: "Segunda Conversa Mock",
      status: "resolved" as const,
      priority: 1,
      lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      unreadCount: 0,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chat - Teste Direto
          </h1>
          <p className="text-gray-600">
            Testando a interface sem Server Actions
          </p>
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Conversas Mock
          </h2>
        </div>

        <ChatConversationsList conversations={mockConversations} />
      </div>
    </div>
  );
}
