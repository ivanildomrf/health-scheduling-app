"use client";

import { createAppointment } from "@/actions/create-appointment";
import { getProfessionalAvailability } from "@/actions/get-professional-availability";
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
import { patientsTable, professionalsTable } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

dayjs.extend(utc);

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Paciente é obrigatório" }),
  professionalId: z.string().min(1, { message: "Médico é obrigatório" }),
  appointmentPrice: z
    .number()
    .min(1, { message: "Valor da consulta é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
});

interface CreateAppointmentFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  professionals: (typeof professionalsTable.$inferSelect)[];
  onSuccess?: () => void;
}

interface ProfessionalAvailability {
  professional: {
    id: string;
    name: string;
    availableFromWeekDay: number;
    availableToWeekDay: number;
    availableFromTime: string;
    availableToTime: string;
  };
  availableSlots: {
    date: string;
    availableTimes: string[];
  }[];
}

const CreateAppointmentForm = ({
  isOpen,
  patients,
  professionals,
  onSuccess,
}: CreateAppointmentFormProps) => {
  const [selectedProfessional, setSelectedProfessional] = useState<
    typeof professionalsTable.$inferSelect | null
  >(null);
  const [professionalAvailability, setProfessionalAvailability] =
    useState<ProfessionalAvailability | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      professionalId: "",
      appointmentPrice: 0,
      time: "",
    },
  });

  const createAppointmentAction = useAction(createAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar agendamento");
    },
  });

  const getProfessionalAvailabilityAction = useAction(
    getProfessionalAvailability,
    {
      onSuccess: ({ data }) => {
        if (data) {
          console.log("=== FRONTEND DEBUG ===");
          console.log("Professional availability data:", data);
          console.log("Available slots count:", data.availableSlots.length);
          console.log("First few slots:", data.availableSlots.slice(0, 5));

          setProfessionalAvailability(data);

          // Converter datas disponíveis para objetos Date
          // Usar uma abordagem mais explícita para evitar problemas de timezone
          const dates = data.availableSlots.map(
            (slot: { date: string; availableTimes: string[] }) => {
              // Criar data explicitamente no timezone local
              const [year, month, day] = slot.date.split("-").map(Number);
              return new Date(year, month - 1, day); // month é 0-indexed
            },
          );

          console.log(
            "Raw slot dates:",
            data.availableSlots.slice(0, 5).map((slot) => slot.date),
          );
          console.log("Converted dates (first 5):", dates.slice(0, 5));
          console.log(
            "Days of week for first 5 dates:",
            dates.slice(0, 5).map((d) => ({
              date: d.toDateString(),
              dayOfWeek: d.getDay(),
              dayName: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][
                d.getDay()
              ],
            })),
          );

          setAvailableDates(dates);

          // Limpar seleção de data e horário quando trocar profissional
          form.setValue("date", undefined as any);
          form.setValue("time", "");
          setAvailableTimes([]);
        }
      },
      onError: (error) => {
        console.error("Erro ao buscar disponibilidade:", error);
        toast.error("Erro ao buscar disponibilidade do profissional");
        setProfessionalAvailability(null);
        setAvailableDates([]);
        setAvailableTimes([]);
      },
    },
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId: "",
        professionalId: "",
        appointmentPrice: 0,
        time: "",
      });
      setSelectedProfessional(null);
      setProfessionalAvailability(null);
      setAvailableDates([]);
      setAvailableTimes([]);
    }
  }, [isOpen, form]);

  // Update appointment price when professional changes
  useEffect(() => {
    if (selectedProfessional) {
      form.setValue(
        "appointmentPrice",
        selectedProfessional.appointmentsPriceInCents / 100,
      );
    }
  }, [selectedProfessional, form]);

  // Update available times when date changes
  useEffect(() => {
    const selectedDate = form.watch("date");
    if (selectedDate && professionalAvailability) {
      const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
      const slot = professionalAvailability.availableSlots.find(
        (slot) => slot.date === dateStr,
      );

      if (slot) {
        setAvailableTimes(slot.availableTimes);
      } else {
        setAvailableTimes([]);
      }

      // Limpar seleção de horário quando trocar data
      form.setValue("time", "");
    }
  }, [form.watch("date"), professionalAvailability]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAppointmentAction.execute({
      ...values,
      appointmentPriceInCents: values.appointmentPrice * 100,
    });
  };

  const selectedPatient = form.watch("patientId");
  const selectedProfessionalId = form.watch("professionalId");
  const isFormReady = selectedPatient && selectedProfessionalId;

  // Função para verificar se uma data está disponível
  const isDateAvailable = (date: Date) => {
    // Converter a data para string no formato YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Verificar se existe um slot para esta data
    const hasSlot = professionalAvailability?.availableSlots.some(
      (slot) => slot.date === dateStr,
    );

    console.log(
      `🔍 Checking date availability: ${dateStr} (${["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][date.getDay()]}) = ${hasSlot}`,
    );

    return hasSlot || false;
  };

  // Função para formatar horário para exibição
  const formatTimeForDisplay = (timeStr: string) => {
    return timeStr.substring(0, 5); // Remove os segundos, mostra apenas HH:mm
  };

  // Função para organizar horários por período
  const organizeTimesByPeriod = (times: string[]) => {
    const morning = times.filter((time) => {
      const hour = parseInt(time.split(":")[0]);
      return hour >= 5 && hour < 12;
    });

    const afternoon = times.filter((time) => {
      const hour = parseInt(time.split(":")[0]);
      return hour >= 12 && hour < 18;
    });

    const evening = times.filter((time) => {
      const hour = parseInt(time.split(":")[0]);
      return hour >= 18;
    });

    return { morning, afternoon, evening };
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Novo Agendamento</DialogTitle>
        <DialogDescription>
          Preencha o formulário abaixo para criar um novo agendamento
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="professionalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const professional = professionals.find(
                      (p) => p.id === value,
                    );
                    setSelectedProfessional(professional || null);

                    // Buscar disponibilidade do profissional
                    if (professional) {
                      console.log("Selected professional:", professional);
                      getProfessionalAvailabilityAction.execute({
                        professionalId: professional.id,
                      });
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name} - {professional.speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="R$ "
                    disabled={!selectedProfessionalId}
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue || 0);
                    }}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
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
                        variant="outline"
                        disabled={
                          !isFormReady ||
                          getProfessionalAvailabilityAction.status ===
                            "executing"
                        }
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>
                            {getProfessionalAvailabilityAction.status ===
                            "executing"
                              ? "Carregando disponibilidade..."
                              : "Selecione uma data"}
                          </span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() ||
                        date < new Date("1900-01-01") ||
                        !isDateAvailable(date)
                      }
                      initialFocus
                      locale={ptBR}
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
            render={({ field }) => {
              const { morning, afternoon, evening } =
                organizeTimesByPeriod(availableTimes);

              return (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isFormReady || availableTimes.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            availableTimes.length === 0
                              ? "Selecione uma data primeiro"
                              : "Selecione um horário"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {morning.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Manhã</SelectLabel>
                          {morning.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTimeForDisplay(time)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {afternoon.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Tarde</SelectLabel>
                          {afternoon.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTimeForDisplay(time)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {evening.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Noite</SelectLabel>
                          {evening.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTimeForDisplay(time)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={createAppointmentAction.status === "executing"}
            >
              {createAppointmentAction.status === "executing"
                ? "Criando..."
                : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CreateAppointmentForm;
