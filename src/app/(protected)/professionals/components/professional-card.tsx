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
import { professionalsTable } from "@/db/schema";
import { formatCurrencyInCentsToBRL } from "@/helpers/currency";
import { CalendarIcon, ClockIcon, PencilIcon } from "lucide-react";
import { getAvailability } from "../helpers/availability";
import UpsertProfessionalForm from "./upsert-professional-form";
interface ProfessionalCardProps {
  professional: typeof professionalsTable.$inferSelect;
}

const ProfessionalCard = ({ professional }: ProfessionalCardProps) => {
  const professionalName = professional.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");

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
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <PencilIcon className="mr-1" />
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <UpsertProfessionalForm />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ProfessionalCard;
