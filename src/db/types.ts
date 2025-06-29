import { type InferSelectModel } from "drizzle-orm";

import {
  appointmentsTable,
  chatConversationsTable,
  chatMessagesTable,
  patientsTable,
  professionalsTable,
} from "./schema";

export type Appointment = InferSelectModel<typeof appointmentsTable>;
export type Patient = InferSelectModel<typeof patientsTable>;
export type Professional = InferSelectModel<typeof professionalsTable>;
export type ChatConversation = InferSelectModel<typeof chatConversationsTable>;
export type ChatMessage = InferSelectModel<typeof chatMessagesTable>;

export type AppointmentWithRelations = Appointment & {
  patient: Pick<Patient, "id" | "name">;
  professional: Pick<Professional, "id" | "name" | "speciality">;
};
