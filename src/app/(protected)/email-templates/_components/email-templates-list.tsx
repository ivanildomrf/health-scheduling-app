"use client";

import { deleteEmailTemplate } from "@/actions/delete-email-template";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
  Calendar,
  Edit,
  Eye,
  Mail,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

dayjs.locale("pt-br");

const EMAIL_TYPE_LABELS = {
  appointment_reminder_24h: "Lembrete 24h",
  appointment_reminder_2h: "Lembrete 2h",
  appointment_confirmed: "Consulta Confirmada",
  appointment_cancelled: "Consulta Cancelada",
  appointment_completed: "Consulta Concluída",
  welcome_patient: "Boas-vindas Paciente",
  welcome_professional: "Boas-vindas Profissional",
  password_reset: "Redefinir Senha",
  custom: "Personalizado",
};

const EMAIL_TYPE_COLORS = {
  appointment_reminder_24h: "bg-blue-100 text-blue-800",
  appointment_reminder_2h: "bg-orange-100 text-orange-800",
  appointment_confirmed: "bg-green-100 text-green-800",
  appointment_cancelled: "bg-red-100 text-red-800",
  appointment_completed: "bg-purple-100 text-purple-800",
  welcome_patient: "bg-cyan-100 text-cyan-800",
  welcome_professional: "bg-indigo-100 text-indigo-800",
  password_reset: "bg-yellow-100 text-yellow-800",
  custom: "bg-gray-100 text-gray-800",
};

interface EmailTemplate {
  id: string;
  name: string;
  type: keyof typeof EMAIL_TYPE_LABELS;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  attachments?: any[];
}

interface EmailTemplatesListProps {
  templates: EmailTemplate[];
}

export function EmailTemplatesList({ templates }: EmailTemplatesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<EmailTemplate | null>(null);

  const { execute: executeDelete, isExecuting: isDeleting } = useAction(
    deleteEmailTemplate,
    {
      onSuccess: () => {
        toast.success("Template excluído com sucesso!");
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao excluir template");
      },
    },
  );

  const handleDeleteClick = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      executeDelete({ id: templateToDelete.id });
    }
  };

  if (templates.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Seus Templates</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.subject}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/email-templates/${template.id}/preview`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/email-templates/${template.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(template)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={EMAIL_TYPE_COLORS[template.type]}
                  >
                    {EMAIL_TYPE_LABELS[template.type]}
                  </Badge>
                  {template.isActive ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Ativo
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800"
                    >
                      Inativo
                    </Badge>
                  )}
                </div>

                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {template.attachments?.length || 0} anexos
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {template.updatedAt
                      ? dayjs(template.updatedAt).format("DD/MM/YY")
                      : "N/A"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/email-templates/${template.id}/preview`}>
                      <Eye className="mr-2 h-3 w-3" />
                      Preview
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/email-templates/${template.id}/edit`}>
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template "
              {templateToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
