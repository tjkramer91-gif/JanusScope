import { redirect } from "next/navigation";
import { requireUser, type SessionUser } from "@/lib/server/auth";
import { logEvent } from "@/lib/server/logger";
import { addAdminAuditLog, getUserProfile, isAdminProfile, type UserProfile } from "@/lib/server/store";

export async function assertAdminUser(user: SessionUser): Promise<UserProfile> {
  const profile = await getUserProfile(user);
  if (!isAdminProfile(profile)) {
    logEvent("warn", "admin.access_denied", { userId: profile.id });
    throw new Error("Admin access required");
  }
  return profile;
}

export async function requireAdminUser(): Promise<UserProfile> {
  const user = await requireUser();
  try {
    return await assertAdminUser(user);
  } catch {
    redirect("/app/dashboard?error=Admin%20access%20required.");
  }
}

export async function trackAdminAction(
  adminUser: SessionUser,
  input: {
    actionType: string;
    targetTable: string;
    targetRecordId?: string | null;
    actionMetadata?: Record<string, unknown>;
  },
): Promise<void> {
  await assertAdminUser(adminUser);
  await addAdminAuditLog(adminUser, input);
}
