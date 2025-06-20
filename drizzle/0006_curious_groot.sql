ALTER TABLE "patients" ADD COLUMN "activation_token" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "activation_token_expires_at" timestamp;