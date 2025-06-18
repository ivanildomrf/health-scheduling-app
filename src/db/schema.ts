import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  notifications: many(notificationsTable),
  usersToClinics: many(usersToClinicsTable),
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
}));

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const sessionsTableRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const accountsTableRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  professionals: many(professionalsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
}));

export const professionalsTable = pgTable("professionals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, {
      onDelete: "cascade",
    }),
  avatarImageUrl: text("avatar_image_url"),
  // 1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday, 0 - Sunday
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  speciality: text("speciality").notNull(),
  appointmentsPriceInCents: integer("appointments_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const professionalsTableRelations = relations(
  professionalsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [professionalsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, {
      onDelete: "cascade",
    }),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  sex: patientSexEnum("sex").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(
  patientsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "active",
  "cancelled",
  "expired",
  "completed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "appointment_confirmed",
  "appointment_cancelled",
  "appointment_reminder_24h",
  "appointment_reminder_2h",
  "appointment_completed",
  "appointment_expired",
  "new_patient_registered",
  "new_professional_added",
  "clinic_updated",
  "system_alert",
]);

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  targetId: uuid("target_id"), // ID da consulta, paciente, etc.
  targetType: text("target_type"), // "appointment", "patient", "professional", etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const notificationsTableRelations = relations(
  notificationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [notificationsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, {
      onDelete: "cascade",
    }),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => professionalsTable.id, {
      onDelete: "cascade",
    }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, {
      onDelete: "cascade",
    }),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  status: appointmentStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    professional: one(professionalsTable, {
      fields: [appointmentsTable.professionalId],
      references: [professionalsTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// Enum para tipos de templates de email
export const emailTemplateTypeEnum = pgEnum("email_template_type", [
  "appointment_reminder_24h",
  "appointment_reminder_2h",
  "appointment_confirmed",
  "appointment_cancelled",
  "appointment_completed",
  "welcome_patient",
  "welcome_professional",
  "password_reset",
  "custom",
]);

// Tabela para templates de email personalizáveis
export const emailTemplatesTable = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Nome do template
  type: emailTemplateTypeEnum("type").notNull(),
  subject: text("subject").notNull(), // Assunto do email
  htmlContent: text("html_content").notNull(), // Conteúdo HTML
  textContent: text("text_content"), // Versão texto
  variables: text("variables"), // JSON com variáveis disponíveis
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // Template padrão do sistema
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para configurações de email da clínica
export const clinicEmailSettingsTable = pgTable("clinic_email_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(), // Nome do remetente
  senderEmail: text("sender_email").notNull(), // Email do remetente
  logoUrl: text("logo_url"), // URL da logo
  primaryColor: text("primary_color").default("#3B82F6"), // Cor primária
  secondaryColor: text("secondary_color").default("#1F2937"), // Cor secundária
  footerText: text("footer_text"), // Texto do rodapé
  clinicAddress: text("clinic_address"), // Endereço da clínica
  clinicPhone: text("clinic_phone"), // Telefone da clínica
  clinicWebsite: text("clinic_website"), // Site da clínica
  emailSignature: text("email_signature"), // Assinatura do email
  enableReminders: boolean("enable_reminders").default(true),
  reminder24hEnabled: boolean("reminder_24h_enabled").default(true),
  reminder2hEnabled: boolean("reminder_2h_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para anexos de email
export const emailAttachmentsTable = pgTable("email_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => emailTemplatesTable.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(), // URL do arquivo no storage
  fileSize: integer("file_size"), // Tamanho em bytes
  mimeType: text("mime_type"), // Tipo MIME
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations para email templates
export const emailTemplatesRelations = relations(
  emailTemplatesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [emailTemplatesTable.clinicId],
      references: [clinicsTable.id],
    }),
    attachments: many(emailAttachmentsTable),
  }),
);

export const clinicEmailSettingsRelations = relations(
  clinicEmailSettingsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [clinicEmailSettingsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const emailAttachmentsRelations = relations(
  emailAttachmentsTable,
  ({ one }) => ({
    template: one(emailTemplatesTable, {
      fields: [emailAttachmentsTable.templateId],
      references: [emailTemplatesTable.id],
    }),
  }),
);
