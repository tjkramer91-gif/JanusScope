import { NextRequest, NextResponse } from "next/server";
import { buildIssueLogCsv } from "@/lib/report";
import { generateRiskReview } from "@/lib/risk-engine";
import { requireUser } from "@/lib/server/auth";
import { addAudit, getProject } from "@/lib/server/store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) return new NextResponse("Not found", { status: 404 });

  const review = generateRiskReview(project);
  await addAudit(user, project.id, "csv.downloaded", {});

  return new NextResponse(buildIssueLogCsv(review.issueLog), {
    headers: {
      "content-type": "text/csv;charset=utf-8",
      "content-disposition": `attachment; filename="${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-issue-log.csv"`,
    },
  });
}
