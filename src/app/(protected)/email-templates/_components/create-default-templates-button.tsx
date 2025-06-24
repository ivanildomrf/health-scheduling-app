"use client";

import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createDefaultEmailTemplates } from "@/actions/create-default-email-templates";
import { Button } from "@/components/ui/button";

export function CreateDefaultTemplatesButton() {
  const router = useRouter();

  const { execute, isExecuting } = useAction(createDefaultEmailTemplates, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || "Templates criados com sucesso!");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar templates padrão");
    },
  });

  const handleCreateDefaults = () => {
    execute({});
  };

  return (
    <Button
      onClick={handleCreateDefaults}
      disabled={isExecuting}
      variant="outline"
    >
      <Wand2 className="mr-2 h-4 w-4" />
      {isExecuting ? "Criando..." : "Criar Templates Padrão"}
    </Button>
  );
}
