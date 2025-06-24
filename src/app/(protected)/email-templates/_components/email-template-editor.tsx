"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Code,
  Eye,
  Info,
  Lightbulb,
  Save,
  Type,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertEmailTemplate } from "@/actions/upsert-email-template";
import {
  type UpsertEmailTemplateSchema,
  upsertEmailTemplateSchema,
} from "@/actions/upsert-email-template/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AVAILABLE_VARIABLES,
  EmailTemplateEngine,
} from "@/helpers/email-template-engine";

import { EmailClientPreview } from "./email-client-preview";

const EMAIL_TYPE_OPTIONS = [
  { value: "appointment_reminder_24h", label: "Lembrete 24h" },
  { value: "appointment_reminder_2h", label: "Lembrete 2h" },
  { value: "appointment_confirmed", label: "Consulta Confirmada" },
  { value: "appointment_cancelled", label: "Consulta Cancelada" },
  { value: "appointment_completed", label: "Consulta Concluída" },
  { value: "welcome_patient", label: "Boas-vindas Paciente" },
  { value: "welcome_professional", label: "Boas-vindas Profissional" },
  { value: "password_reset", label: "Redefinir Senha" },
  { value: "custom", label: "Personalizado" },
];

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{clinicName}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid {{primaryColor}};
            margin-bottom: 30px;
        }
        .appointment-card {
            background: #f8f9fa;
            border-left: 4px solid {{primaryColor}};
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .button {
            display: inline-block;
            background: {{primaryColor}};
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 5px;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #eee;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: {{primaryColor}};">{{clinicName}}</h1>
    </div>
    <div class="content">
        <h2>Olá, {{patientName}}!</h2>
        <p>Este é um lembrete sobre sua consulta agendada:</p>
        <div class="appointment-card">
            <h3>Detalhes da Consulta</h3>
            <p><strong>Profissional:</strong> {{professionalName}} - {{professionalSpecialty}}</p>
            <p><strong>Data:</strong> {{appointmentDate}}</p>
            <p><strong>Horário:</strong> {{appointmentTime}}</p>
            <p><strong>Duração:</strong> {{appointmentDuration}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmationUrl}}" class="button">Confirmar Consulta</a>
            <a href="{{rescheduleUrl}}" class="button" style="background: #6b7280;">Reagendar</a>
        </div>
        <p><strong>Endereço:</strong><br>{{clinicAddress}}</p>
        <p><strong>Telefone:</strong> {{clinicPhone}}</p>
    </div>
    <div class="footer">
        <p>{{footerText}}</p>
        <p>{{clinicName}} - {{currentYear}}</p>
    </div>
</body>
</html>`;

interface EmailTemplateEditorProps {
  initialData?: any;
  isEditing?: boolean;
}

export function EmailTemplateEditor({
  initialData,
  isEditing = false,
}: EmailTemplateEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("editor");
  const [previewHtml, setPreviewHtml] = useState("");

  const form = useForm<UpsertEmailTemplateSchema>({
    resolver: zodResolver(upsertEmailTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "custom",
      subject: initialData?.subject || "{{clinicName}} - Lembrete de Consulta",
      htmlContent: initialData?.htmlContent || DEFAULT_TEMPLATE,
      textContent: initialData?.textContent || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const { execute, isExecuting } = useAction(upsertEmailTemplate, {
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Template atualizado com sucesso!"
          : "Template criado com sucesso!",
      );
      router.push("/email-templates");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao salvar template");
    },
  });

  useEffect(() => {
    const htmlContent = form.watch("htmlContent");
    if (htmlContent) {
      setPreviewHtml(EmailTemplateEngine.generatePreview(htmlContent));
    }
  }, [form.watch("htmlContent")]);

  const handleSubmit = (data: UpsertEmailTemplateSchema) => {
    execute({
      ...data,
      id: initialData?.id,
    });
  };

  const insertVariable = (variable: string) => {
    const currentHtml = form.getValues("htmlContent");
    const newHtml = currentHtml + `{{${variable}}}`;
    form.setValue("htmlContent", newHtml);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/email-templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab("preview")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button type="submit" form="template-form" disabled={isExecuting}>
            <Save className="mr-2 h-4 w-4" />
            {isExecuting ? "Salvando..." : "Salvar Template"}
          </Button>
        </div>
      </div>

      {activeTab === "editor" ? (
        // Layout do Editor com sidebar
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">
                  <Code className="mr-2 h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <Form {...form}>
                  <form
                    id="template-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Template</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Lembrete de Consulta Personalizado"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo do Template</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EMAIL_TYPE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assunto do Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: {{clinicName}} - Lembrete de Consulta"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use variáveis como patientName para personalizar
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="htmlContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo HTML</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Conteúdo HTML do email..."
                              className="min-h-[400px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use HTML e variáveis para criar seu template
                            personalizado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="textContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versão Texto (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Versão em texto simples do email..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Versão alternativa em texto para clientes que não
                            suportam HTML
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Template Ativo
                            </FormLabel>
                            <FormDescription>
                              Templates ativos podem ser usados para envio de
                              emails
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar das variáveis - apenas visível no modo editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Variáveis Disponíveis
                </CardTitle>
                <CardDescription>
                  Clique para inserir no template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {Object.entries(AVAILABLE_VARIABLES).map(
                      ([variable, description]) => (
                        <div key={variable} className="space-y-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto w-full justify-start p-2 text-left"
                            onClick={() =>
                              insertVariable(variable.replace(/[{}]/g, ""))
                            }
                          >
                            <div>
                              <div className="font-mono text-xs text-blue-600">
                                {variable}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {description}
                              </div>
                            </div>
                          </Button>
                          <Separator />
                        </div>
                      ),
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Info className="mt-1 h-3 w-3 text-blue-500" />
                  <p>Use variáveis entre chaves duplas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Layout do Preview - sem sidebar, largura total
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="editor">
                <Code className="mr-2 h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <div className="space-y-4">
                {/* Header do preview */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">
                          Preview do Template
                        </h3>
                        <p className="text-sm text-blue-700">
                          Visualização com dados de exemplo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("editor")}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Code className="mr-2 h-3 w-3" />
                        Voltar ao Editor
                      </Button>
                      {initialData?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Link
                            href={`/email-templates/${initialData.id}/preview`}
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            Preview Completo
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview do email - largura total */}
                <div className="w-full">
                  <EmailClientPreview
                    subject={form.watch("subject") || "Assunto do Email"}
                    htmlContent={previewHtml}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
