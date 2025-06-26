"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Archive, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  userName: string;
}

export function ClinicChatWindow({
  conversation,
  userName,
}: ClinicChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      // Por enquanto, vamos usar dados mock para evitar problemas de build
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Olá, preciso agendar uma consulta.",
          senderType: "patient",
          senderName: conversation.patientName,
          createdAt: new Date(Date.now() - 60000),
        },
        {
          id: "2",
          content: "Olá! Claro, vou te ajudar com o agendamento.",
          senderType: "receptionist",
          senderName: userName,
          createdAt: new Date(),
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversation.patientName, userName]);

  useEffect(() => {
    fetchMessages();
  }, [conversation.id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setIsSendingMessage(true);
    try {
      // Por enquanto, vamos simular o envio
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        senderType: "receptionist",
        senderName: userName,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      scrollToBottom();
      toast.success("Mensagem enviada!");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleArchiveConversation = async () => {
    setIsArchiving(true);
    try {
      // Fazer chamada para a API de arquivamento
      const response = await fetch("/api/chat/archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          reason: "Encerrada manualmente pela clínica",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao encerrar conversa");
      }

      toast.success("Conversa encerrada com sucesso!");

      // Aguardar um pouco antes de redirecionar para mostrar o toast
      setTimeout(() => {
        router.push("/chat");
      }, 1000);
    } catch (error) {
      console.error("Erro ao encerrar conversa:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao encerrar conversa",
      );
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="flex h-[600px] flex-col">
      {/* Header da conversa */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/chat">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

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

          {/* Botão de encerrar conversa */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isArchiving}
                className="text-orange-600 hover:text-orange-700"
              >
                <Archive className="mr-2 h-4 w-4" />
                Encerrar Conversa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar Conversa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja encerrar esta conversa? Esta ação não
                  pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleArchiveConversation}
                  disabled={isArchiving}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isArchiving ? "Encerrando..." : "Encerrar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Área das mensagens */}
      <ScrollArea className="flex-1 p-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Nenhuma mensagem ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderType === "patient"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    message.senderType === "patient"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={`mt-1 text-xs ${
                      message.senderType === "patient"
                        ? "text-gray-500"
                        : "text-blue-100"
                    }`}
                  >
                    {message.senderName} •{" "}
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Área de envio de mensagem */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[40px] resize-none"
            disabled={isSendingMessage}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || isSendingMessage}
            className="shrink-0"
          >
            {isSendingMessage ? (
              "Enviando..."
            ) : (
              <>
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
