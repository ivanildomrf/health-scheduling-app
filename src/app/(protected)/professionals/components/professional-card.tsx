"use client";
import { deleteProfessional } from "@/actions/delete-professional";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { professionalsTable } from "@/db/schema";
import { formatCurrencyInCentsToBRL } from "@/helpers/currency";
import { CalendarIcon, ClockIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { getAvailability } from "../helpers/availability";
import UpsertProfessionalForm from "./upsert-professional-form";
interface ProfessionalCardProps {
  professional: typeof professionalsTable.$inferSelect;
}

const ProfessionalCard = ({ professional }: ProfessionalCardProps) => {
  const [isUpsertProfessionalDialogOpen, setIsUpsertProfessionalDialogOpen] =
    useState(false);

  const professionalName = professional.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");

  const deleteProfessionalAction = useAction(deleteProfessional, {
    onSuccess: () => {
      toast.success("Médico deletado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao deletar médico");
    },
  });

  const handleDeleteProfessionalClick = () => {
    if (!professional) return;
    deleteProfessionalAction.execute({
      id: professional.id,
    });
  };

  const availability = getAvailability(professional);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{professionalName}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-sm font-medium">{professional.name}</h1>
            <p className="text-muted-foreground text-sm">
              {professional.speciality}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">
          <CalendarIcon className="mr-1" />
          {availability.from.format("dddd")} a {availability.to.format("dddd")}
        </Badge>
        <Badge variant="outline">
          <ClockIcon className="mr-1" />
          {availability.from.format("HH:mm")} às{" "}
          {availability.to.format("HH:mm")}
        </Badge>
        <Badge variant="outline">
          {formatCurrencyInCentsToBRL(professional.appointmentsPriceInCents)}
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-2">
        <Dialog
          open={isUpsertProfessionalDialogOpen}
          onOpenChange={setIsUpsertProfessionalDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">
              <PencilIcon className="mr-1" />
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <UpsertProfessionalForm
            professional={{
              ...professional,
              availableToTime: availability.to.format("HH:mm:ss"),
              availableFromTime: availability.from.format("HH:mm:ss"),
            }}
            onSuccess={() => {
              setIsUpsertProfessionalDialogOpen(false);
            }}
          />
        </Dialog>
        {professional && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <TrashIcon />
                Deletar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja deletar o profissional?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser revertida. Isso irá deletar o
                  profissional e todas as consultas agendadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProfessionalClick}
                  disabled={deleteProfessionalAction.isExecuting}
                >
                  {deleteProfessionalAction.isExecuting
                    ? "Deletando..."
                    : "Deletar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfessionalCard;
