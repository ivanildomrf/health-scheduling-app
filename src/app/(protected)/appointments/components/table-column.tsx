"use client";

import { appointmentsTable } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentTableActions } from "./table-actions";

type Appointment = typeof appointmentsTable.$inferSelect & {
  patient: {
    name: string;
  };
  professional: {
    name: string;
    speciality: string;
  };
};

export const appointmentTableColumns: ColumnDef<Appointment>[] = [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
  },
  {
    id: "professional",
    accessorKey: "professional.name",
    header: "Profissional",
  },
  {
    id: "speciality",
    accessorKey: "professional.speciality",
    header: "Especialidade",
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      const date = row.original.date;
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    },
  },
  {
    id: "time",
    accessorKey: "date",
    header: "Horário",
    cell: ({ row }) => {
      const date = row.original.date;
      return format(new Date(date), "HH:mm", { locale: ptBR });
    },
  },
  {
    id: "price",
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: ({ row }) => {
      const price = row.original.appointmentPriceInCents;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price / 100);
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      const statusConfig = {
        active: {
          text: "Confirmado",
          className: "bg-green-50 text-green-700 ring-green-600/20",
        },
        cancelled: {
          text: "Cancelado",
          className: "bg-red-50 text-red-700 ring-red-600/20",
        },
        expired: {
          text: "Expirado",
          className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
        },
        completed: {
          text: "Concluído",
          className: "bg-blue-50 text-blue-700 ring-blue-600/20",
        },
      };

      const config = statusConfig[status] || statusConfig.active;

      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
        >
          {config.text}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const appointment = row.original;
      return <AppointmentTableActions appointment={appointment} />;
    },
  },
];
