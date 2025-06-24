"use client";

import dayjs from "dayjs";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { cancelPatientAppointment } from "@/actions/cancel-patient-appointment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CancelAppointmentModalProps {
  appointmentId: string;
  appointmentDate: Date;
  professionalName: string;
  children: React.ReactNode;
}

export function CancelAppointmentModal({
  appointmentId,
  appointmentDate,
  professionalName,
  children,
}: CancelAppointmentModalProps) {
  const cancelAction = useAction(cancelPatientAppointment, {
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso!");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cancelar agendamento");
    },
  });

  const handleCancel = () => {
    cancelAction.execute({
      appointmentId,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja cancelar a consulta com{" "}
            <strong>{professionalName}</strong> marcada para{" "}
            <strong>
              {dayjs(appointmentDate).format("DD/MM/YYYY [às] HH:mm")}
            </strong>
            ?
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Manter Consulta</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={cancelAction.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {cancelAction.isPending ? "Cancelando..." : "Sim, Cancelar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
