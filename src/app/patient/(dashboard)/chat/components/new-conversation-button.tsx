"use client";

import { MessageCirclePlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createChatConversation } from "@/actions/create-chat-conversation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface NewConversationButtonProps {
  patientId: string;
}

export function NewConversationButton({
  patientId,
}: NewConversationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("1");
  const [initialMessage, setInitialMessage] = useState("");

  const { execute: executeCreateConversation, isExecuting } = useAction(
    createChatConversation,
    {
      onSuccess: () => {
        toast.success("Conversa criada com sucesso!");
        setOpen(false);
        setSubject("");
        setPriority("1");
        setInitialMessage("");
        router.refresh(); // Atualizar a página
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao criar conversa");
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Por favor, informe o assunto da conversa");
      return;
    }

    if (!initialMessage.trim()) {
      toast.error("Por favor, escreva uma mensagem inicial");
      return;
    }

    executeCreateConversation({
      patientId,
      subject: subject.trim(),
      priority: parseInt(priority),
      initialMessage: initialMessage.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCirclePlus className="mr-2 h-4 w-4" />
          Nova Conversa
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Nova Conversa</DialogTitle>
          <DialogDescription>
            Inicie uma nova conversa com a equipe da clínica.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              placeholder="Descreva brevemente o assunto..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Baixa</SelectItem>
                <SelectItem value="2">Média</SelectItem>
                <SelectItem value="3">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-message">
              Mensagem inicial *
              <span className="ml-1 text-sm text-gray-500">
                (Descreva sua dúvida ou solicitação)
              </span>
            </Label>
            <Textarea
              id="initial-message"
              placeholder="Descreva sua dúvida ou solicitação..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              rows={3}
              maxLength={500}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isExecuting || !subject.trim() || !initialMessage.trim()
              }
            >
              {isExecuting ? "Criando..." : "Criar Conversa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
