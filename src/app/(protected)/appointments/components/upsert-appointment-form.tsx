"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getProfessionalAvailability } from "@/actions/get-professional-availability";
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
import { type AppointmentWithRelations, type Professional } from "@/db/types";

import { useAppointmentsContext } from "./appointments-context";

dayjs.extend(utc);

const formSchema = z.object({
  professionalId: z.string().min(1, { message: "Profissional é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
});

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

interface UpsertAppointmentFormProps {
  isOpen: boolean;
  appointment: AppointmentWithRelations;
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({
  isOpen,
  appointment,
  onSuccess,
}: UpsertAppointmentFormProps) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [professionalAvailability, setProfessionalAvailability] =
    useState<ProfessionalAvailability | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const { onRefresh } = useAppointmentsContext();

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
      // Revalidar os dados da tabela
      if (onRefresh) {
        onRefresh();
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar agendamento");
    },
  });

  const getProfessionalAvailabilityAction = useAction(
    getProfessionalAvailability,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setProfessionalAvailability(data);

          // Converter datas disponíveis para objetos Date
          const dates = data.availableSlots.map(
            (slot: { date: string; availableTimes: string[] }) => {
              // Criar data explicitamente no timezone local
              const [year, month, day] = slot.date.split("-").map(Number);
              return new Date(year, month - 1, day); // month é 0-indexed
            },
          );

          setAvailableDates(dates);

          // Se já há uma data selecionada, atualizar os horários disponíveis
          const selectedDate = form.watch("date");
          if (selectedDate) {
            updateAvailableTimes(selectedDate, data);
          }
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
      const professional = professionals.find(
        (p) => p.id === appointment.professionalId,
      );

      const formData = {
        professionalId: appointment.professionalId,
        date: appointmentDate,
        time: format(appointmentDate, "HH:mm:ss"),
      };

      setSelectedProfessional(professional || null);

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

        // Buscar disponibilidade do profissional atual
        if (professional) {
          getProfessionalAvailabilityAction.execute({
            professionalId: professional.id,
          });
        }
      }, 100);
    } else if (!isOpen) {
      setIsFormInitialized(false);
      setProfessionalAvailability(null);
      setAvailableDates([]);
      setAvailableTimes([]);
      setSelectedProfessional(null);
    }
  }, [isOpen, appointment, form, professionals]);

  // Atualizar horários disponíveis quando a data mudar
  useEffect(() => {
    const selectedDate = form.watch("date");
    if (selectedDate && professionalAvailability) {
      updateAvailableTimes(selectedDate, professionalAvailability);
    }
  }, [form.watch("date"), professionalAvailability]);

  const updateAvailableTimes = (
    selectedDate: Date,
    availability: ProfessionalAvailability,
  ) => {
    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
    const slot = availability.availableSlots.find(
      (slot) => slot.date === dateStr,
    );

    if (slot) {
      // Filtrar horários que não sejam o horário atual do agendamento (para permitir manter o mesmo horário)
      const currentTime = format(new Date(appointment.date), "HH:mm:ss");
      const currentDateStr = dayjs(appointment.date).format("YYYY-MM-DD");

      let availableTimesForDate = slot.availableTimes;

      // Se é a mesma data do agendamento original, incluir o horário atual
      if (dateStr === currentDateStr) {
        const timeSet = new Set([...slot.availableTimes, currentTime]);
        availableTimesForDate = Array.from(timeSet).sort();
      }

      setAvailableTimes(availableTimesForDate);
    } else {
      setAvailableTimes([]);
    }

    // Limpar seleção de horário se não estiver disponível
    const currentSelectedTime = form.watch("time");
    if (
      currentSelectedTime &&
      slot &&
      !slot.availableTimes.includes(currentSelectedTime)
    ) {
      // Só limpar se não for o horário original do agendamento
      const currentTime = format(new Date(appointment.date), "HH:mm:ss");
      const currentDateStr = dayjs(appointment.date).format("YYYY-MM-DD");

      if (
        !(dateStr === currentDateStr && currentSelectedTime === currentTime)
      ) {
        form.setValue("time", "");
      }
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Validar se o horário está disponível
    const selectedDate = dayjs(values.date).format("YYYY-MM-DD");
    const selectedTime = values.time;

    // Verificar se é o mesmo agendamento (mesma data e horário)
    const originalDate = dayjs(appointment.date).format("YYYY-MM-DD");
    const originalTime = format(new Date(appointment.date), "HH:mm:ss");

    const isSameDateTime =
      selectedDate === originalDate && selectedTime === originalTime;

    if (!isSameDateTime) {
      // Verificar disponibilidade apenas se mudou data/horário
      const slot = professionalAvailability?.availableSlots.find(
        (s) => s.date === selectedDate,
      );
      if (!slot || !slot.availableTimes.includes(selectedTime)) {
        toast.error("Horário não disponível para o profissional selecionado");
        return;
      }
    }

    upsertAppointmentAction.execute({
      id: appointment.id,
      ...values,
    });
  };

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

    // Se é a data original do agendamento, sempre permitir
    const originalDateStr = dayjs(appointment.date).format("YYYY-MM-DD");
    if (dateStr === originalDateStr) {
      return true;
    }

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

  const selectedPatient = appointment.patient.name;
  const selectedProfessionalId = form.watch("professionalId");
  const isFormReady = selectedProfessionalId && isFormInitialized;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Editar Agendamento</DialogTitle>
        <DialogDescription>
          Edite as informações do agendamento para {selectedPatient}
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
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const professional = professionals.find(
                      (p) => p.id === value,
                    );
                    setSelectedProfessional(professional || null);

                    // Buscar disponibilidade do novo profissional
                    if (professional) {
                      getProfessionalAvailabilityAction.execute({
                        professionalId: professional.id,
                      });
                    }

                    // Limpar seleções de data e horário
                    form.setValue("date", undefined as any);
                    form.setValue("time", "");
                    setAvailableTimes([]);
                  }}
                  value={field.value}
                >
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                {availableTimes.length > 0 ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(() => {
                        const { morning, afternoon, evening } =
                          organizeTimesByPeriod(availableTimes);
                        return (
                          <>
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
                          </>
                        );
                      })()}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-muted-foreground rounded border p-2 text-sm">
                    {form.watch("date") && isFormReady
                      ? "Não existe horário disponível na data selecionada"
                      : "Selecione uma data primeiro"}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                upsertAppointmentAction.status === "executing" ||
                !isFormReady ||
                !form.watch("date") ||
                !form.watch("time")
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
