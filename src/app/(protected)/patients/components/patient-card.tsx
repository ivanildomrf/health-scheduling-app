"use client";

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
import { patientsTable } from "@/db/schema";
import { MailIcon, PencilIcon, PhoneIcon } from "lucide-react";
import { useState } from "react";
import UpsertPatientForm from "./upsert-patient-form";

interface PatientCardProps {
  patient: typeof patientsTable.$inferSelect;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const [isUpsertPatientDialogOpen, setIsUpsertPatientDialogOpen] =
    useState(false);

  const patientName = patient.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");

  const sexLabel = patient.sex === "male" ? "Masculino" : "Feminino";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{patientName}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-sm font-medium">{patient.name}</h1>
            <p className="text-muted-foreground text-sm">{sexLabel}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">
          <MailIcon className="mr-1" />
          {patient.email}
        </Badge>
        <Badge variant="outline">
          <PhoneIcon className="mr-1" />
          {patient.phone}
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-2">
        <Dialog
          open={isUpsertPatientDialogOpen}
          onOpenChange={setIsUpsertPatientDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">
              <PencilIcon className="mr-1" />
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <UpsertPatientForm
            patient={patient}
            isOpen={isUpsertPatientDialogOpen}
            onSuccess={() => {
              setIsUpsertPatientDialogOpen(false);
            }}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
