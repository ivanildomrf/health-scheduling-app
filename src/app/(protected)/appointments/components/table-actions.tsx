import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cancelAppointment } from "@/actions/cancel-appointment";
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
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { appointmentsTable } from "@/db/schema";
import { EditIcon, MoreVerticalIcon, XIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import UpsertAppointmentForm from "./upsert-appointment-form";

interface AppointmentTableActionsProps {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: {
      name: string;
    };
    professional: {
      name: string;
      speciality: string;
    };
  };
}

export const AppointmentTableActions = ({
  appointment,
}: AppointmentTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState<boolean>(false);

  const cancelAppointmentAction = useAction(cancelAppointment, {
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar agendamento");
    },
  });

  const handleCancelAppointmentClick = () => {
    if (!appointment) return;
    cancelAppointmentAction.execute({
      id: appointment.id,
    });
  };

  const isActive = appointment.status === "active";

  return (
    <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            <span className="font-bold">
              {appointment.patient.name} - {appointment.professional.name}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isActive && (
            <DropdownMenuItem onClick={() => setUpsertDialogIsOpen(true)}>
              <EditIcon />
              Editar
            </DropdownMenuItem>
          )}
          {isActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <XIcon />
                  Cancelar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Tem certeza que deseja cancelar o agendamento?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser revertida. O agendamento será
                    cancelado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelAppointmentClick}
                    disabled={cancelAppointmentAction.isExecuting}
                  >
                    {cancelAppointmentAction.isExecuting
                      ? "Cancelando..."
                      : "Confirmar Cancelamento"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!isActive && (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">
                Agendamento cancelado
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isActive && (
        <UpsertAppointmentForm
          isOpen={upsertDialogIsOpen}
          appointment={appointment}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      )}
    </Dialog>
  );
};

export default AppointmentTableActions;
