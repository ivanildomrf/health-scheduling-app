"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { patientsTable, professionalsTable } from "@/db/schema";

import CreateAppointmentForm from "./create-appointment-form";

interface AddAppointmentButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
  professionals: (typeof professionalsTable.$inferSelect)[];
}

const AddAppointmentButton = ({
  patients,
  professionals,
}: AddAppointmentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Novo Agendamento
        </Button>
      </DialogTrigger>
      <CreateAppointmentForm
        isOpen={isOpen}
        patients={patients}
        professionals={professionals}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddAppointmentButton;
