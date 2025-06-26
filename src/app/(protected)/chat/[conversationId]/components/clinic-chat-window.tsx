"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getChatMessages } from "@/actions/get-chat-messages";
import { sendChatMessage } from "@/actions/send-chat-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  content: string;
  senderType: "patient" | "receptionist" | "admin";
  senderName: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  subject: string;
  status: "active" | "resolved" | "archived";
  priority: number;
  patientId: string;
  patientName: string;
  patientEmail: string;
}

interface ClinicChatWindowProps {
  conversation: Conversation;
  userId: string;
  userName: string;
}

export function ClinicChatWindow({
  conversation,
  userId,
  userName,
}: ClinicChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Actions
  const { execute: fetchMessages, isExecuting: isLoadingMessages } = useAction(
    getChatMessages,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setMessages(data.data);
        }
      },
      onError: ({ error }) => {
        console.error("Erro ao carregar mensagens:", error);
        toast.error("Erro ao carregar mensagens");
      },
    },
  );

  const { execute: sendMessage, isExecuting: isSendingMessage } = useAction(
    sendChatMessage,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setMessages((prev) => [...prev, data.data]);
          setNewMessage("");
          scrollToBottom();
        }
      },
      onError: ({ error }) => {
        console.error("Erro ao enviar mensagem:", error);
        toast.error("Erro ao enviar mensagem");
      },
    },
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages({
      conversationId: conversation.id,
      limit: 100,
    });
  }, [conversation.id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    sendMessage({
      conversationId: conversation.id,
      content: newMessage.trim(),
      senderType: "receptionist",
      senderUserId: userId,
      senderName: userName,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex h-[600px] flex-col">
      {/* Header da conversa */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {conversation.patientName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {conversation.patientName}
            </h3>
            <p className="text-sm text-gray-600">{conversation.subject}</p>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoadingMessages ? (
            <div className="text-center text-gray-500">
              Carregando mensagens...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              Nenhuma mensagem ainda. Seja o primeiro a responder!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderType === "patient"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.senderType === "patient"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="text-sm font-medium">
                    {message.senderName}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div
                    className={`mt-1 text-xs ${
                      message.senderType === "patient"
                        ? "text-gray-500"
                        : "text-blue-100"
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Área de envio de mensagem */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua resposta..."
            className="min-h-[60px] flex-1 resize-none"
            disabled={isSendingMessage}
            rows={2}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSendingMessage}
            className="h-[60px] px-6"
          >
            <Send className="h-4 w-4" />
            {isSendingMessage ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
