"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import UpsertPatientForm from "./upsert-patient-form";

const AddPatientButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Adicionar Paciente
        </Button>
      </DialogTrigger>
      <UpsertPatientForm isOpen={isOpen} onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddPatientButton;
