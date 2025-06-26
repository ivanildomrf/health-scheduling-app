"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClinicConversation {
  id: string;
  subject: string;
  status: "active" | "resolved" | "archived";
  priority: number;
  lastMessageAt: Date;
  createdAt: Date;
  assignedUserId: string | null;

  // Dados do paciente
  patientId: string;
  patientName: string;
  patientEmail: string;

  // Mensagens não lidas
  unreadCount: number | null;
}

interface ClinicChatListProps {
  conversations: ClinicConversation[];
  currentUserId: string;
}

export function ClinicChatList({
  conversations,
  currentUserId,
}: ClinicChatListProps) {
  // Verificar se conversations é um array válido
  if (!Array.isArray(conversations)) {
    console.error("Conversations prop is not an array:", conversations);
    return (
      <div className="p-8 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Erro ao carregar conversas
        </h3>
        <p className="mt-2 text-gray-600">Tente recarregar a página.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return "Alta";
      case 2:
        return "Média";
      default:
        return "Baixa";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "resolved":
        return "Resolvida";
      case "archived":
        return "Arquivada";
      default:
        return status;
    }
  };

  // Separar conversas por status
  const activeConversations = conversations.filter(
    (c) => c.status === "active",
  );
  const resolvedConversations = conversations.filter(
    (c) => c.status === "resolved",
  );
  const archivedConversations = conversations.filter(
    (c) => c.status === "archived",
  );

  const ConversationItem = ({
    conversation,
  }: {
    conversation: ClinicConversation;
  }) => (
    <div className="border-b border-gray-100 p-4 transition-colors last:border-b-0 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Avatar do paciente */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {conversation.patientName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {/* Nome do paciente e assunto */}
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate text-sm font-medium text-gray-900">
                {conversation.patientName}
              </h3>
              {conversation.unreadCount && conversation.unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-xs text-red-800"
                >
                  {conversation.unreadCount} nova
                  {conversation.unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <p className="mb-2 truncate text-sm text-gray-600">
              {conversation.subject}
            </p>

            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className={getPriorityColor(conversation.priority)}
              >
                {getPriorityLabel(conversation.priority)}
              </Badge>
              <Badge
                variant="secondary"
                className={getStatusColor(conversation.status)}
              >
                {getStatusLabel(conversation.status)}
              </Badge>
              {conversation.assignedUserId === currentUserId && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Atribuída a você
                </Badge>
              )}
            </div>

            <div className="flex items-center text-xs text-gray-500">
              <Clock className="mr-1 h-3 w-3" />
              Última mensagem{" "}
              {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
        </div>

        <div className="ml-4 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/chat/${conversation.id}`}>Responder</Link>
          </Button>
        </div>
      </div>
    </div>
  );

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Nenhuma conversa ainda
        </h3>
        <p className="mt-2 text-gray-600">
          Os pacientes podem iniciar conversas através do portal do paciente.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Conversas ativas */}
      {activeConversations.length > 0 && (
        <div>
          <div className="bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900">
            Conversas Ativas ({activeConversations.length})
          </div>
          {activeConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      )}

      {/* Conversas resolvidas */}
      {resolvedConversations.length > 0 && (
        <div>
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
            Conversas Resolvidas ({resolvedConversations.length})
          </div>
          {resolvedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      )}

      {/* Conversas arquivadas */}
      {archivedConversations.length > 0 && (
        <div>
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
            Conversas Arquivadas ({archivedConversations.length})
          </div>
          {archivedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
