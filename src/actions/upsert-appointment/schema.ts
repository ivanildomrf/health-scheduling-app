import { z } from "zod";

export const upsertAppointmentSchema = z.object({
  id: z.string().uuid(),
  professionalId: z.string().min(1, { message: "Profissional é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
});
