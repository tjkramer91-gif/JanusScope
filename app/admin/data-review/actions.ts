"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/server/auth";
import { updateAdminDataReviewItem } from "@/lib/server/store";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateDataReviewItemAction(formData: FormData) {
  const user = await requireUser();
  const action = formString(formData, "reviewAction");
  await updateAdminDataReviewItem(user, {
    id: formString(formData, "id"),
    action: action === "approve" || action === "reject" || action === "exclude" ? action : "save",
    normalizedTrade: formString(formData, "normalizedTrade"),
    normalizedScopeCategory: formString(formData, "normalizedScopeCategory"),
    normalizedScopeSubcategory: formString(formData, "normalizedScopeSubcategory"),
    adminNotes: formString(formData, "adminNotes"),
  });
  revalidatePath("/admin/data-review");
  revalidatePath("/admin/pricing");
}
