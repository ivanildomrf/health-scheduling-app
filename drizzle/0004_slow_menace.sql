CREATE TYPE "public"."address_type" AS ENUM('rua', 'avenida', 'travessa', 'alameda', 'praca', 'estrada', 'rodovia', 'outro');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('cisgender', 'transgenero', 'nao_binario', 'outro', 'nao_informado');--> statement-breakpoint
CREATE TYPE "public"."phone_type" AS ENUM('residencial', 'comercial', 'celular', 'recado');--> statement-breakpoint
CREATE TYPE "public"."race_color" AS ENUM('branca', 'preta', 'parda', 'amarela', 'indigena', 'sem_informacao');--> statement-breakpoint
CREATE TYPE "public"."relationship" AS ENUM('pai', 'mae', 'filho', 'filha', 'conjuge', 'companheiro', 'irmao', 'irma', 'avo', 'avo_feminino', 'tio', 'tia', 'primo', 'prima', 'cunhado', 'cunhada', 'sogro', 'sogra', 'genro', 'nora', 'tutor', 'curador', 'responsavel_legal', 'outro');--> statement-breakpoint
CREATE TABLE "patient_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"patient_id" uuid NOT NULL,
	CONSTRAINT "patient_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "social_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "mother_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "mother_unknown" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "birth_date" timestamp;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "race_color" "race_color";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "nationality" text DEFAULT 'brasileira';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "birth_city" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "birth_state" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "birth_country" text DEFAULT 'Brasil';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "naturalization_date" timestamp;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "passport_number" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "passport_country" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "passport_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "passport_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "phone_type" "phone_type" DEFAULT 'celular';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "phone_ddd" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_type" "address_type";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_number" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_complement" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_neighborhood" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "country" text DEFAULT 'Brasil';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "zip_code" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "cpf" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "rg_number" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "rg_complement" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "rg_state" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "rg_issuer" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "rg_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "cns_number" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "guardian_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "guardian_relationship" "relationship";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "guardian_cpf" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "emergency_contact" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "emergency_phone" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "profile_image_url" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD CONSTRAINT "patient_sessions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_cpf_unique" UNIQUE("cpf");--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_cns_number_unique" UNIQUE("cns_number");