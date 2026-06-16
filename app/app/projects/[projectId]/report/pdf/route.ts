import { NextRequest, NextResponse } from "next/server";
import { buildHtmlReport } from "@/lib/report";
import { generateRiskReview } from "@/lib/risk-engine";
import { requireUser } from "@/lib/server/auth";
import { addAudit, getProject } from "@/lib/server/store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) return new NextResponse("Not found", { status: 404 });

  const review = generateRiskReview(project);
  const html = buildHtmlReport(project, review);

  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate: `<div style="font-size:9px;color:#6b7280;width:100%;text-align:center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
      headerTemplate: `<div style="font-size:9px;color:#6b7280;width:100%;padding-left:36px;">SubScope Risk Output</div>`,
      margin: { top: "0.7in", right: "0.6in", bottom: "0.7in", left: "0.6in" },
    });
    await browser.close();
    await addAudit(user, project.id, "pdf.downloaded", {});

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-risk-report.pdf"`,
      },
    });
  } catch (error) {
    return new NextResponse(`PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
}
