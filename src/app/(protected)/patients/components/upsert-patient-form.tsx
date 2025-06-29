"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { upsertPatient } from "@/actions/upsert-patient";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patientsTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(1, { message: "Telefone é obrigatório" }),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
});

interface UpsertPatientFormProps {
  isOpen: boolean;
  patient?: typeof patientsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertPatientForm = ({
  patient,
  onSuccess,
  isOpen,
}: UpsertPatientFormProps) => {
  const [savedPatientId, setSavedPatientId] = useState<string | null>(
    patient?.id || null,
  );
  const [isSendingCredentials, setIsSendingCredentials] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: patient?.name ?? "",
      email: patient?.email ?? "",
      phone: patient?.phone ?? "",
      sex: patient?.sex ?? "male",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(patient);
      setSavedPatientId(patient?.id || null);
    }
  }, [isOpen, patient]);

  const upsertPatientAction = useAction(upsertPatient, {
    onSuccess: ({ data }) => {
      toast.success("Paciente cadastrado com sucesso");

      if (data && "patient" in data && data.patient?.id) {
        setSavedPatientId(data.patient.id);

        // Se é um novo paciente (não estava editando), não fechar o dialog ainda
        // para permitir envio de credenciais/convites
        if (!patient?.id) {
          // Não chamar onSuccess() ainda para manter o dialog aberto
          return;
        }
      }

      // Para edição de pacientes existentes, fechar normalmente
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar paciente");
    },
  });

  const handleSendCredentials = async () => {
    const patientId = savedPatientId || patient?.id;
    if (!patientId) {
      toast.error("Erro: ID do paciente não encontrado");
      return;
    }

    setIsSendingCredentials(true);
    try {
      const response = await fetch("/api/patient/send-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      });

      if (response.ok) {
        toast.success("Credenciais enviadas com sucesso!");
      } else {
        toast.error("Erro ao enviar credenciais");
      }
    } catch {
      toast.error("Erro ao enviar credenciais");
    } finally {
      setIsSendingCredentials(false);
    }
  };

  const handleSendInvite = async () => {
    const patientId = savedPatientId || patient?.id;
    if (!patientId) {
      toast.error("Erro: ID do paciente não encontrado");
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await fetch("/api/patient/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      });

      if (response.ok) {
        toast.success("Convite enviado com sucesso!");
      } else {
        toast.error("Erro ao enviar convite");
      }
    } catch {
      toast.error("Erro ao enviar convite");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertPatientAction.execute({
      ...values,
      id: patient?.id,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {patient ? patient.name : "Cadastrar Paciente"}
        </DialogTitle>
        <DialogDescription>
          {patient
            ? "Edite as informações do paciente"
            : "Preencha o formulário abaixo para cadastrar um novo paciente"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do paciente</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value.value);
                    }}
                    format="(##) #####-####"
                    mask="_"
                    customInput={Input}
                    placeholder="(99) 99999-9999"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="flex flex-col gap-4">
            {/* Seção de acesso ao portal - aparece após salvar OU se está editando paciente existente */}
            {(savedPatientId || patient?.id) && (
              <div className="w-full space-y-4 border-t border-gray-200 pt-4">
                {/* Título da seção */}
                <div className="text-center">
                  <h4 className="mb-1 text-sm font-semibold text-gray-900">
                    🌐 Acesso ao Portal do Paciente
                  </h4>
                  <p className="text-xs text-gray-600">
                    {patient?.id
                      ? "Reenvie credenciais ou convite se necessário:"
                      : "Escolha como o paciente receberá acesso ao portal:"}
                  </p>
                </div>

                {/* Botões de ação */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCredentials}
                    disabled={isSendingCredentials}
                    className="w-full justify-start"
                  >
                    <span className="mr-2 text-blue-600">🔐</span>
                    {isSendingCredentials
                      ? "Enviando..."
                      : patient?.id
                        ? "Reenviar Credenciais"
                        : "Enviar Credenciais"}
                    <span className="ml-auto text-xs text-gray-500">
                      Email + senha temporária (cadastro presencial)
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendInvite}
                    disabled={isSendingInvite}
                    className="w-full justify-start"
                  >
                    <span className="mr-2 text-green-600">📧</span>
                    {isSendingInvite
                      ? "Enviando..."
                      : patient?.id
                        ? "Reenviar Convite"
                        : "Enviar Convite"}
                    <span className="ml-auto text-xs text-gray-500">
                      Link para o paciente definir própria senha
                    </span>
                  </Button>
                </div>

                {/* Botão principal - Atualizar ou Finalizar */}
                {patient?.id ? (
                  <Button
                    type="submit"
                    disabled={upsertPatientAction.isPending}
                    className="w-full"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {upsertPatientAction.isPending
                      ? "Salvando..."
                      : "Atualizar Paciente"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onSuccess?.()}
                    className="w-full"
                  >
                    Finalizar Cadastro
                  </Button>
                )}
              </div>
            )}

            {/* Botão de salvar - só aparece se não foi salvo ainda */}
            {!savedPatientId && !patient?.id && (
              <Button
                type="submit"
                disabled={upsertPatientAction.isPending}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {upsertPatientAction.isPending
                  ? "Salvando..."
                  : "Salvar Paciente"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertPatientForm;
