import { db } from "@/db";
import { clinicsTable, planFeatureLimitsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface PlanLimits {
  maxProfessionals: number | null; // null = unlimited
  hasAdvancedMetrics: boolean;
  hasCompleteMetrics: boolean;
  hasAutomaticConfirmation: boolean;
  hasChatSupport: boolean;
  hasPrioritySupport: boolean;
  hasDetailedReports: boolean;
  hasCalendarIntegration: boolean;
  hasCustomReports: boolean;
  hasApiAccess: boolean;
  hasAutomaticBackup: boolean;
  hasMultipleLocations: boolean;
}

export async function getClinicPlanLimits(
  clinicId: string,
): Promise<PlanLimits> {
  const clinic = await db.query.clinicsTable.findFirst({
    where: eq(clinicsTable.id, clinicId),
    with: {
      currentPlan: {
        with: {
          planFeatureLimits: {
            where: eq(planFeatureLimitsTable.enabled, true),
            with: {
              feature: true,
            },
          },
        },
      },
    },
  });

  if (!clinic?.currentPlan) {
    // Retorna limites padrão do plano Essential se não houver plano definido
    return {
      maxProfessionals: 3,
      hasAdvancedMetrics: false,
      hasCompleteMetrics: false,
      hasAutomaticConfirmation: false,
      hasChatSupport: false,
      hasPrioritySupport: false,
      hasDetailedReports: false,
      hasCalendarIntegration: false,
      hasCustomReports: false,
      hasApiAccess: false,
      hasAutomaticBackup: false,
      hasMultipleLocations: false,
    };
  }

  const features = clinic.currentPlan.planFeatureLimits.reduce(
    (acc, limit) => {
      const featureName = limit.feature.name;
      acc[featureName] = {
        enabled: limit.enabled,
        limitValue: limit.limitValue,
      };
      return acc;
    },
    {} as Record<string, { enabled: boolean; limitValue: number | null }>,
  );

  return {
    maxProfessionals: features.max_professionals?.limitValue ?? null,
    hasAdvancedMetrics: features.advanced_metrics?.enabled ?? false,
    hasCompleteMetrics: features.complete_metrics?.enabled ?? false,
    hasAutomaticConfirmation: features.automatic_confirmation?.enabled ?? false,
    hasChatSupport: features.chat_support?.enabled ?? false,
    hasPrioritySupport: features.priority_support?.enabled ?? false,
    hasDetailedReports: features.detailed_reports?.enabled ?? false,
    hasCalendarIntegration: features.calendar_integration?.enabled ?? false,
    hasCustomReports: features.custom_reports?.enabled ?? false,
    hasApiAccess: features.api_access?.enabled ?? false,
    hasAutomaticBackup: features.automatic_backup?.enabled ?? false,
    hasMultipleLocations: features.multiple_locations?.enabled ?? false,
  };
}

export async function checkPlanLimit(
  clinicId: string,
  featureName: string,
  currentUsage?: number,
): Promise<{ allowed: boolean; limit: number | null; current: number }> {
  const limits = await getClinicPlanLimits(clinicId);

  switch (featureName) {
    case "max_professionals":
      const limit = limits.maxProfessionals;
      const current = currentUsage ?? 0;
      return {
        allowed: limit === null || current < limit,
        limit,
        current,
      };
    default:
      return { allowed: true, limit: null, current: 0 };
  }
}
