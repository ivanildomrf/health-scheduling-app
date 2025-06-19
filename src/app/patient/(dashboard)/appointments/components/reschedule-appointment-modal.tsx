"use client";

import { reschedulePatientAppointment } from "@/actions/reschedule-patient-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const rescheduleSchema = z.object({
  newDate: z.date({
    required_error: "Selecione uma nova data",
  }),
  newTime: z.string().min(1, "Selecione um horário"),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface RescheduleAppointmentModalProps {
  appointmentId: string;
  currentDate: Date;
  professionalName: string;
  children: React.ReactNode;
}

export function RescheduleAppointmentModal({
  appointmentId,
  currentDate,
  professionalName,
  children,
}: RescheduleAppointmentModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
  });

  const rescheduleAction = useAction(reschedulePatientAppointment, {
    onSuccess: () => {
      toast.success("Agendamento remarcado com sucesso!");
      setOpen(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao remarcar agendamento");
    },
  });

  const onSubmit = (data: RescheduleFormData) => {
    rescheduleAction.execute({
      appointmentId,
      newDate: data.newDate,
      newTime: data.newTime,
    });
  };

  // Horários disponíveis (exemplo - idealmente viria da API)
  const availableTimes = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remarcar Consulta</DialogTitle>
          <DialogDescription>
            Reagendando consulta com {professionalName} de{" "}
            {dayjs(currentDate).format("DD/MM/YYYY [às] HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Nova Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("DD/MM/YYYY")
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
              name="newTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Novo Horário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={rescheduleAction.isPending}>
                {rescheduleAction.isPending ? "Remarcando..." : "Remarcar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
