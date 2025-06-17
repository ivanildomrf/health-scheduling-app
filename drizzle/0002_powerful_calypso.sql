CREATE TYPE "public"."notification_type" AS ENUM('appointment_confirmed', 'appointment_cancelled', 'appointment_reminder_24h', 'appointment_reminder_2h', 'appointment_completed', 'appointment_expired', 'new_patient_registered', 'new_professional_added', 'clinic_updated', 'system_alert');--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE 'expired';--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE 'completed';--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"user_id" text NOT NULL,
	"target_id" uuid,
	"target_type" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;