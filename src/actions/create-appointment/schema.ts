import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, { message: "Paciente é obrigatório" }),
  professionalId: z.string().min(1, { message: "Médico é obrigatório" }),
  appointmentPriceInCents: z
    .number()
    .min(1, { message: "Valor da consulta é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
});
