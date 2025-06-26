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

export const planStatusEnum = pgEnum("plan_status", [
  "active",
  "cancelled",
  "expired",
  "trial",
]);

export const featureTypeEnum = pgEnum("feature_type", [
  "boolean", // true/false features
  "limit", // numeric limits
  "access", // access to specific functionality
]);

// Tabela de planos disponíveis
export const plansTable = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // "Essential", "Professional", "Enterprise"
  slug: text("slug").notNull().unique(), // "essential", "professional", "enterprise"
  description: text("description").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  stripePriceId: text("stripe_price_id"), // Para integração com Stripe
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela de funcionalidades/features do sistema
export const planFeaturesTable = pgTable("plan_features", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // "max_professionals", "unlimited_appointments", etc.
  displayName: text("display_name").notNull(), // "Cadastro de profissionais", "Agendamentos ilimitados"
  description: text("description"),
  featureType: featureTypeEnum("feature_type").notNull(),
  category: text("category"), // "limits", "features", "support", etc.
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela de relacionamento entre planos e funcionalidades com limites
export const planFeatureLimitsTable = pgTable("plan_feature_limits", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plansTable.id, { onDelete: "cascade" }),
  featureId: uuid("feature_id")
    .notNull()
    .references(() => planFeaturesTable.id, { onDelete: "cascade" }),

  // Para features boolean: enabled = true/false
  // Para features limit: limitValue = número
  // Para features access: enabled = true/false
  enabled: boolean("enabled").default(true).notNull(),
  limitValue: integer("limit_value"), // null = unlimited

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),

  // Referência ao plano atual
  currentPlanId: uuid("current_plan_id").references(() => plansTable.id),
  planStatus: planStatusEnum("plan_status").default("trial").notNull(),
  planStartDate: timestamp("plan_start_date").defaultNow(),
  planEndDate: timestamp("plan_end_date"),

  // Integração com Stripe
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),

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

export const plansTableRelations = relations(plansTable, ({ many }) => ({
  clinics: many(clinicsTable),
  planFeatureLimits: many(planFeatureLimitsTable),
}));

export const planFeaturesTableRelations = relations(
  planFeaturesTable,
  ({ many }) => ({
    planFeatureLimits: many(planFeatureLimitsTable),
  }),
);

export const planFeatureLimitsTableRelations = relations(
  planFeatureLimitsTable,
  ({ one }) => ({
    plan: one(plansTable, {
      fields: [planFeatureLimitsTable.planId],
      references: [plansTable.id],
    }),
    feature: one(planFeaturesTable, {
      fields: [planFeatureLimitsTable.featureId],
      references: [planFeaturesTable.id],
    }),
  }),
);

export const clinicsTableRelations = relations(
  clinicsTable,
  ({ many, one }) => ({
    professionals: many(professionalsTable),
    patients: many(patientsTable),
    appointments: many(appointmentsTable),
    usersToClinics: many(usersToClinicsTable),
    currentPlan: one(plansTable, {
      fields: [clinicsTable.currentPlanId],
      references: [plansTable.id],
    }),
  }),
);

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

export const raceColorEnum = pgEnum("race_color", [
  "branca",
  "preta",
  "parda",
  "amarela",
  "indigena",
  "sem_informacao",
]);

export const genderEnum = pgEnum("gender", [
  "cisgender",
  "transgenero",
  "nao_binario",
  "outro",
  "nao_informado",
]);

export const addressTypeEnum = pgEnum("address_type", [
  "rua",
  "avenida",
  "travessa",
  "alameda",
  "praca",
  "estrada",
  "rodovia",
  "outro",
]);

export const relationshipEnum = pgEnum("relationship", [
  "pai",
  "mae",
  "filho",
  "filha",
  "conjuge",
  "companheiro",
  "irmao",
  "irma",
  "avo",
  "avo_feminino",
  "tio",
  "tia",
  "primo",
  "prima",
  "cunhado",
  "cunhada",
  "sogro",
  "sogra",
  "genro",
  "nora",
  "tutor",
  "curador",
  "responsavel_legal",
  "outro",
]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Dados básicos de identificação
  name: text("name").notNull(),
  socialName: text("social_name"),
  motherName: text("mother_name"),
  motherUnknown: boolean("mother_unknown").default(false),
  sex: patientSexEnum("sex").notNull(),
  gender: genderEnum("gender"),
  birthDate: timestamp("birth_date"),
  raceColor: raceColorEnum("race_color"),

  // Dados de nacionalidade
  nationality: text("nationality").default("brasileira"),
  birthCity: text("birth_city"),
  birthState: text("birth_state"),
  birthCountry: text("birth_country").default("Brasil"),
  naturalizationDate: timestamp("naturalization_date"),

  // Documentos para estrangeiros
  passportNumber: text("passport_number"),
  passportCountry: text("passport_country"),
  passportIssueDate: timestamp("passport_issue_date"),
  passportExpiryDate: timestamp("passport_expiry_date"),

  // Contato
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),

  // Endereço completo
  addressType: addressTypeEnum("address_type"),
  addressName: text("address_name"),
  addressNumber: text("address_number"),
  addressComplement: text("address_complement"),
  addressNeighborhood: text("address_neighborhood"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("Brasil"),
  zipCode: text("zip_code"),

  // Documentos brasileiros
  cpf: text("cpf").unique(),
  rgNumber: text("rg_number"),
  rgComplement: text("rg_complement"),
  rgState: text("rg_state"),
  rgIssuer: text("rg_issuer"),
  rgIssueDate: timestamp("rg_issue_date"),
  cnsNumber: text("cns_number").unique(),

  // Guardião/Representante legal
  guardianName: text("guardian_name"),
  guardianRelationship: relationshipEnum("guardian_relationship"),
  guardianCpf: text("guardian_cpf"),

  // Contato de emergência (mantido para compatibilidade)
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),

  // Dados do sistema
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, {
      onDelete: "cascade",
    }),
  password: text("password").notNull(),
  profileImageUrl: text("profile_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  emailVerified: boolean("email_verified").default(false).notNull(),

  // Campos para ativação de conta
  activationToken: text("activation_token"),
  activationTokenExpiresAt: timestamp("activation_token_expires_at"),

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
    sessions: many(patientSessionsTable),
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

// Tabela de sessões para pacientes
export const patientSessionsTable = pgTable("patient_sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
});

export const patientSessionsTableRelations = relations(
  patientSessionsTable,
  ({ one }) => ({
    patient: one(patientsTable, {
      fields: [patientSessionsTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

// ========================= SISTEMA DE CHAT =========================

// Enum para status da conversa
export const chatConversationStatusEnum = pgEnum("chat_conversation_status", [
  "active",
  "resolved",
  "archived",
]);

// Enum para tipo de participante
export const chatParticipantTypeEnum = pgEnum("chat_participant_type", [
  "patient",
  "receptionist",
  "admin",
]);

// Tabela de conversas de chat
export const chatConversationsTable = pgTable("chat_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(), // Assunto da conversa
  status: chatConversationStatusEnum("status").default("active").notNull(),
  priority: integer("priority").default(1).notNull(), // 1=baixa, 2=média, 3=alta
  assignedUserId: text("assigned_user_id").references(() => usersTable.id), // Recepcionista responsável
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela de mensagens do chat
export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => chatConversationsTable.id, { onDelete: "cascade" }),

  // Dados do remetente
  senderType: chatParticipantTypeEnum("sender_type").notNull(),
  senderPatientId: uuid("sender_patient_id").references(() => patientsTable.id),
  senderUserId: text("sender_user_id").references(() => usersTable.id),
  senderName: text("sender_name").notNull(), // Nome para exibição

  // Conteúdo da mensagem
  content: text("content").notNull(),
  messageType: text("message_type").default("text").notNull(), // text, image, file, system
  attachmentUrl: text("attachment_url"), // URL do anexo se houver
  attachmentName: text("attachment_name"), // Nome original do arquivo
  attachmentSize: integer("attachment_size"), // Tamanho em bytes
  attachmentMimeType: text("attachment_mime_type"), // Tipo MIME

  // Controle de leitura
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  readBy: text("read_by").references(() => usersTable.id),

  // Controle de sistema
  isSystemMessage: boolean("is_system_message").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela para marcar mensagens não lidas por usuário
export const chatUnreadMessagesTable = pgTable("chat_unread_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => chatConversationsTable.id, { onDelete: "cascade" }),

  // Quem tem mensagens não lidas
  userType: chatParticipantTypeEnum("user_type").notNull(),
  userId: text("user_id").references(() => usersTable.id), // Para recepcionistas
  patientId: uuid("patient_id").references(() => patientsTable.id), // Para pacientes

  unreadCount: integer("unread_count").default(0).notNull(),
  lastReadMessageId: uuid("last_read_message_id").references(
    () => chatMessagesTable.id,
  ),
  lastReadAt: timestamp("last_read_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Relations para chat
export const chatConversationsTableRelations = relations(
  chatConversationsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [chatConversationsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [chatConversationsTable.patientId],
      references: [patientsTable.id],
    }),
    assignedUser: one(usersTable, {
      fields: [chatConversationsTable.assignedUserId],
      references: [usersTable.id],
    }),
    resolvedByUser: one(usersTable, {
      fields: [chatConversationsTable.resolvedBy],
      references: [usersTable.id],
    }),
    messages: many(chatMessagesTable),
    unreadMessages: many(chatUnreadMessagesTable),
  }),
);

export const chatMessagesTableRelations = relations(
  chatMessagesTable,
  ({ one }) => ({
    conversation: one(chatConversationsTable, {
      fields: [chatMessagesTable.conversationId],
      references: [chatConversationsTable.id],
    }),
    senderPatient: one(patientsTable, {
      fields: [chatMessagesTable.senderPatientId],
      references: [patientsTable.id],
    }),
    senderUser: one(usersTable, {
      fields: [chatMessagesTable.senderUserId],
      references: [usersTable.id],
    }),
    readByUser: one(usersTable, {
      fields: [chatMessagesTable.readBy],
      references: [usersTable.id],
    }),
  }),
);

export const chatUnreadMessagesTableRelations = relations(
  chatUnreadMessagesTable,
  ({ one }) => ({
    conversation: one(chatConversationsTable, {
      fields: [chatUnreadMessagesTable.conversationId],
      references: [chatConversationsTable.id],
    }),
    user: one(usersTable, {
      fields: [chatUnreadMessagesTable.userId],
      references: [usersTable.id],
    }),
    patient: one(patientsTable, {
      fields: [chatUnreadMessagesTable.patientId],
      references: [patientsTable.id],
    }),
    lastReadMessage: one(chatMessagesTable, {
      fields: [chatUnreadMessagesTable.lastReadMessageId],
      references: [chatMessagesTable.id],
    }),
  }),
);
