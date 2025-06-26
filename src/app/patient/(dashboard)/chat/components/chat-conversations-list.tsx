"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  subject: string;
  status: "active" | "resolved" | "archived";
  priority: number;
  lastMessageAt: Date;
  createdAt: Date;
  unreadCount: number | null;
}

interface ChatConversationsListProps {
  conversations: Conversation[];
}

export function ChatConversationsList({
  conversations,
}: ChatConversationsListProps) {
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

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Nenhuma conversa ainda
        </h3>
        <p className="mt-2 text-gray-600">
          Inicie uma nova conversa para entrar em contato com a equipe da
          clínica.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="p-4 transition-colors hover:bg-gray-50"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {conversation.subject}
                </h3>
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {conversation.unreadCount} nova
                    {conversation.unreadCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

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

            <div className="ml-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/patient/chat/${conversation.id}`}>
                  Abrir Chat
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
