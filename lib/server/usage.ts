import { errorMessage, logEvent } from "@/lib/server/logger";
import { recordUsageEvent } from "@/lib/server/store";
import { sanitizeUsageEventMetadata } from "@/lib/usage-sanitizer";
import type { SessionUser } from "@/lib/server/auth";
import type { UsageEventType } from "@/lib/types";

export { sanitizeUsageEventMetadata } from "@/lib/usage-sanitizer";

export const USAGE_EVENT_TYPES = [
  "signup",
  "login",
  "project_created",
  "document_uploaded",
  "document_classified",
  "report_generated",
  "pdf_downloaded",
  "project_brain_viewed",
  "budget_uploaded",
  "budget_column_mapped",
  "budget_compared",
  "budget_report_generated",
  "pricing_item_extracted",
  "risk_finding_created",
  "feedback_submitted",
  "admin_data_approved",
  "admin_data_rejected",
  "admin_data_excluded",
  "lead_score_updated",
] as const satisfies readonly UsageEventType[];

export async function trackUsageEvent(
  user: SessionUser,
  eventType: UsageEventType,
  options: {
    projectId?: string | null;
    eventMetadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  try {
    await recordUsageEvent(user, {
      eventType,
      projectId: options.projectId ?? null,
      eventMetadata: sanitizeUsageEventMetadata(options.eventMetadata),
    });
  } catch (error) {
    logEvent("warn", "usage_event.write_failed", { userId: user.id, eventType, reason: errorMessage(error) });
  }
}
