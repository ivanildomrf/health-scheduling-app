"use client";

import { upsertAppointment } from "@/actions/upsert-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsTable, professionalsTable } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  professionalId: z.string().min(1, { message: "Profissional é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
});

interface UpsertAppointmentFormProps {
  isOpen: boolean;
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: {
      name: string;
    };
    professional: {
      name: string;
      speciality: string;
    };
  };
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({
  isOpen,
  appointment,
  onSuccess,
}: UpsertAppointmentFormProps) => {
  const [professionals, setProfessionals] = useState<
    (typeof professionalsTable.$inferSelect)[]
  >([]);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      professionalId: "",
      date: undefined,
      time: "",
    },
  });

  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar agendamento");
    },
  });

  // Buscar profissionais da clínica
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch("/api/professionals");
        if (response.ok) {
          const data = await response.json();
          setProfessionals(data);
        }
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
      }
    };

    if (isOpen) {
      fetchProfessionals();
    }
  }, [isOpen]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen && appointment && professionals.length > 0) {
      const appointmentDate = new Date(appointment.date);
      const formData = {
        professionalId: appointment.professionalId,
        date: appointmentDate,
        time: format(appointmentDate, "HH:mm"),
      };

      setTimeout(() => {
        form.reset(formData, {
          keepErrors: false,
          keepDirty: false,
          keepIsSubmitted: false,
          keepTouched: false,
          keepIsValid: false,
          keepSubmitCount: false,
        });
        setIsFormInitialized(true);
      }, 100);
    } else if (!isOpen) {
      setIsFormInitialized(false);
    }
  }, [isOpen, appointment, form, professionals]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertAppointmentAction.execute({
      id: appointment.id,
      ...values,
    });
  };

  // Simplificar a lógica - sempre habilitar se não estiver executando
  const isFormReady = true;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Editar Agendamento</DialogTitle>
        <DialogDescription>
          Edite as informações do agendamento para {appointment.patient.name}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="professionalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profissional</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Profissionais</SelectLabel>
                      {professionals.map((professional) => (
                        <SelectItem
                          key={professional.id}
                          value={professional.id}
                        >
                          {professional.name} - {professional.speciality}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={"w-full pl-3 text-left font-normal"}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    placeholder="Selecione o horário"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                upsertAppointmentAction.status === "executing" || !isFormReady
              }
            >
              {upsertAppointmentAction.status === "executing"
                ? "Atualizando..."
                : "Atualizar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;
