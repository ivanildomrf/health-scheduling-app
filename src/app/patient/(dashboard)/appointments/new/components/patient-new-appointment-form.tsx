"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createPatientAppointment } from "@/actions/create-patient-appointment";
import { getPatientProfessionalAvailability } from "@/actions/get-patient-professional-availability";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { professionalsTable } from "@/db/schema";
import { formatCurrencyInCentsToBRL } from "@/helpers/currency";

dayjs.extend(utc);

const formSchema = z.object({
  professionalId: z.string().min(1, { message: "Profissional é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
});

interface PatientNewAppointmentFormProps {
  patientId: string;
  clinicId: string;
  professionals: (typeof professionalsTable.$inferSelect)[];
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

export function PatientNewAppointmentForm({
  patientId,
  clinicId,
  professionals,
}: PatientNewAppointmentFormProps) {
  const router = useRouter();
  const [selectedProfessional, setSelectedProfessional] = useState<
    (typeof professionals)[0] | null
  >(null);
  const [professionalAvailability, setProfessionalAvailability] =
    useState<ProfessionalAvailability | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalId: "",
      time: "",
    },
  });

  const createAppointmentAction = useAction(createPatientAppointment, {
    onSuccess: () => {
      toast.success("Consulta agendada com sucesso!");
      router.push("/patient/appointments");
    },
    onError: () => {
      toast.error("Erro ao agendar consulta");
    },
  });

  const getPatientProfessionalAvailabilityAction = useAction(
    getPatientProfessionalAvailability,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setProfessionalAvailability(data);

          // Converter datas disponíveis para objetos Date
          const dates = data.availableSlots.map(
            (slot: { date: string; availableTimes: string[] }) => {
              const [year, month, day] = slot.date.split("-").map(Number);
              return new Date(year, month - 1, day);
            },
          );

          setAvailableDates(dates);

          // Limpar seleção de data e horário quando trocar profissional
          form.setValue("date", undefined as any);
          form.setValue("time", "");
          setAvailableTimes([]);
        }
      },
      onError: () => {
        toast.error("Erro ao buscar disponibilidade do profissional");
      },
    },
  );

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
    if (!selectedProfessional) return;

    const appointmentDateTime = dayjs(values.date)
      .hour(parseInt(values.time.split(":")[0]))
      .minute(parseInt(values.time.split(":")[1]))
      .utc()
      .toDate();

    createAppointmentAction.execute({
      professionalId: values.professionalId,
      appointmentPriceInCents: selectedProfessional.appointmentsPriceInCents,
      date: appointmentDateTime,
      time: values.time,
    });
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (availableDate) =>
        dayjs(availableDate).format("YYYY-MM-DD") ===
        dayjs(date).format("YYYY-MM-DD"),
    );
  };

  const formatTimeForDisplay = (timeStr: string) => {
    return timeStr.substring(0, 5); // Remove segundos se houver
  };

  const organizeTimesByPeriod = (times: string[]) => {
    const morning = times.filter((time) => {
      const hour = parseInt(time.split(":")[0]);
      return hour < 12;
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

  const handleProfessionalChange = (professionalId: string) => {
    const professional = professionals.find((p) => p.id === professionalId);
    setSelectedProfessional(professional || null);

    if (professional) {
      getPatientProfessionalAvailabilityAction.execute({
        professionalId: professional.id,
      });
    }
  };

  const timesByPeriod = organizeTimesByPeriod(availableTimes);

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <div className="flex items-center gap-2">
        <Link href="/patient/appointments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Agendamentos
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Seleção do Profissional */}
          <FormField
            control={form.control}
            name="professionalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profissional</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleProfessionalChange(value);
                  }}
                  value={field.value}
                  disabled={createAppointmentAction.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name} - {professional.speciality} -{" "}
                        {formatCurrencyInCentsToBRL(
                          professional.appointmentsPriceInCents,
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Seleção da Data */}
          {selectedProfessional && (
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Consulta</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                          disabled={
                            getPatientProfessionalAvailabilityAction.isPending ||
                            createAppointmentAction.isPending
                          }
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
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
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today || !isDateAvailable(date);
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Seleção do Horário */}
          {form.watch("date") && availableTimes.length > 0 && (
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <div className="space-y-4">
                    {timesByPeriod.morning.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          Manhã
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {timesByPeriod.morning.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={
                                field.value === time ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(time)}
                              disabled={createAppointmentAction.isPending}
                            >
                              {formatTimeForDisplay(time)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {timesByPeriod.afternoon.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          Tarde
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {timesByPeriod.afternoon.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={
                                field.value === time ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(time)}
                              disabled={createAppointmentAction.isPending}
                            >
                              {formatTimeForDisplay(time)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {timesByPeriod.evening.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          Noite
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {timesByPeriod.evening.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={
                                field.value === time ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(time)}
                              disabled={createAppointmentAction.isPending}
                            >
                              {formatTimeForDisplay(time)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Resumo do Agendamento */}
          {selectedProfessional && form.watch("date") && form.watch("time") && (
            <div className="rounded-lg border bg-blue-50 p-4">
              <h3 className="mb-2 font-medium text-blue-900">
                Resumo do Agendamento
              </h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  <strong>Profissional:</strong> {selectedProfessional.name}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {format(form.watch("date"), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <p>
                  <strong>Horário:</strong>{" "}
                  {formatTimeForDisplay(form.watch("time"))}
                </p>
                <p>
                  <strong>Valor:</strong>{" "}
                  {formatCurrencyInCentsToBRL(
                    selectedProfessional.appointmentsPriceInCents,
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Link href="/patient/appointments" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={createAppointmentAction.isPending}
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                !selectedProfessional ||
                !form.watch("date") ||
                !form.watch("time") ||
                createAppointmentAction.isPending
              }
            >
              {createAppointmentAction.isPending
                ? "Agendando..."
                : "Agendar Consulta"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
