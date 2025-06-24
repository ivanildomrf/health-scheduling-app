CREATE TYPE "public"."feature_type" AS ENUM('boolean', 'limit', 'access');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'cancelled', 'expired', 'trial');--> statement-breakpoint
CREATE TABLE "plan_feature_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"limit_value" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plan_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"feature_type" "feature_type" NOT NULL,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "plan_features_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"price_in_cents" integer NOT NULL,
	"stripe_price_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "plans_name_unique" UNIQUE("name"),
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "current_plan_id" uuid;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "plan_status" "plan_status" DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "plan_start_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "plan_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "plan_feature_limits" ADD CONSTRAINT "plan_feature_limits_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_feature_limits" ADD CONSTRAINT "plan_feature_limits_feature_id_plan_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."plan_features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_current_plan_id_plans_id_fk" FOREIGN KEY ("current_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;