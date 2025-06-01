import { z } from "zod";

export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    specialty: z.string().min(1, { message: "Especialidade é obrigatório" }),
    appointmentPriceInCents: z
      .number()
      .min(1, { message: "Preço da consulta é obrigatório" }),
    availableFromWeekDay: z.number().min(0).max(6),
    availableToWeekDay: z.number().min(0).max(6),
    availableFromTime: z
      .string()
      .min(1, { message: "Hora de início é obrigatório" }),
    availableToTime: z
      .string()
      .min(1, { message: "Hora de término é obrigatório" }),
  })
  .refine(
    (data) => {
      return data.availableFromWeekDay !== data.availableToWeekDay;
    },
    {
      message:
        "O dia inicial e o dia final de disponibilidade não podem ser o mesmo",
      path: ["availableToWeekDay"],
    },
  )
  .refine(
    (data) => {
      return data.availableFromTime !== data.availableToTime;
    },
    {
      message:
        "O horário inicial e o horário final de disponibilidade não podem ser o mesmo",
      path: ["availableToTime"],
    },
  )
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      message: "O horário inicial deve ser menor que o horário final",
      path: ["availableToTime"],
    },
  );

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;
