"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Clock, Send } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getChatMessages } from "@/actions/get-chat-messages";
import { sendChatMessage } from "@/actions/send-chat-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  senderType: "patient" | "receptionist" | "admin";
  senderName: string;
  messageType: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isSystemMessage: boolean;
  createdAt: Date;
}

interface Conversation {
  id: string;
  subject: string;
  status: "active" | "resolved" | "archived";
  priority: number;
  createdAt: Date;
}

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  patientId: string;
  patientName: string;
}

export function ChatWindow({
  conversation,
  messages: initialMessages,
  patientId,
  patientName,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Action para buscar mensagens
  const { execute: fetchMessages } = useAction(getChatMessages, {
    onSuccess: ({ data }) => {
      if (data?.data) {
        setMessages(data.data);
      }
    },
    onError: ({ error }) => {
      console.error("Erro ao carregar mensagens:", error);
    },
  });

  // Action para enviar mensagem
  const { execute: executeSendMessage, isExecuting } = useAction(
    sendChatMessage,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          // Adicionar a nova mensagem à lista
          setMessages((prev) => [...prev, data.data]);
          setNewMessage("");
          scrollToBottom();
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao enviar mensagem");
      },
    },
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Buscar mensagens ao montar o componente
  useEffect(() => {
    fetchMessages({
      conversationId: conversation.id,
      limit: 100,
    });
  }, [conversation.id, fetchMessages]);

  // Atualizar mensagens quando as props iniciais mudam
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Buscar mensagens periodicamente (polling)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages({
        conversationId: conversation.id,
        limit: 100,
      });
    }, 5000); // Buscar a cada 5 segundos

    return () => clearInterval(interval);
  }, [conversation.id, fetchMessages]);

  // Buscar mensagens quando a página ganha foco
  useEffect(() => {
    const handleFocus = () => {
      fetchMessages({
        conversationId: conversation.id,
        limit: 100,
      });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [conversation.id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    executeSendMessage({
      conversationId: conversation.id,
      content: newMessage.trim(),
      senderType: "patient",
      senderPatientId: patientId,
      senderName: patientName,
    });
  };

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

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/patient/chat">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-gray-900">
              {conversation.subject}
            </h1>
            <div className="mt-1 flex items-center gap-2">
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
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderType === "patient"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                  message.senderType === "patient"
                    ? "bg-blue-500 text-white"
                    : message.isSystemMessage
                      ? "bg-gray-100 text-sm text-gray-600"
                      : "bg-gray-200 text-gray-900"
                }`}
              >
                {!message.isSystemMessage &&
                  message.senderType !== "patient" && (
                    <div className="mb-1 text-xs font-medium opacity-75">
                      {message.senderName}
                    </div>
                  )}

                <div className="whitespace-pre-wrap">{message.content}</div>

                <div
                  className={`mt-1 flex items-center gap-1 text-xs ${
                    message.senderType === "patient"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {format(new Date(message.createdAt), "HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      {conversation.status === "active" && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              maxLength={2000}
              disabled={isExecuting}
            />
            <Button
              type="submit"
              disabled={isExecuting || !newMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {conversation.status !== "active" && (
        <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500">
          Esta conversa foi{" "}
          {conversation.status === "resolved" ? "resolvida" : "arquivada"} e não
          aceita mais mensagens.
        </div>
      )}
    </div>
  );
}
