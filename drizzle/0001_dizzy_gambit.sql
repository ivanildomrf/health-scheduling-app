CREATE TYPE "public"."appointment_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "appointment_price_in_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "status" "appointment_status" DEFAULT 'active' NOT NULL;