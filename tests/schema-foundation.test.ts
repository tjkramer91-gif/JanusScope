import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(join(process.cwd(), "supabase/schema.sql"), "utf8").toLowerCase();

describe("supabase backend foundation schema", () => {
  it("contains the Project Brain, admin intelligence, feedback, and usage tables", () => {
    for (const table of [
      "companies",
      "project_memory",
      "usage_events",
      "admin_audit_log",
      "feedback",
      "data_review_queue",
      "lead_scores",
      "budgets",
      "budget_versions",
      "budget_line_items",
      "budget_comparisons",
      "budget_comparison_results",
      "pricing_benchmark_records",
    ]) {
      expect(schema).toContain(`create table if not exists ${table}`);
    }
  });

  it("adds admin, consent, and BudgetScope project fields", () => {
    for (const column of [
      "is_admin boolean",
      "last_login_at timestamptz",
      "lead_status text",
      "company_id uuid",
      "asset_type text",
      "renovation_or_new text",
      "unit_count integer",
      "gross_square_feet numeric",
      "rentable_square_feet numeric",
      "building_count integer",
      "funding_type text",
      "current_phase text",
      "allowed_for_anonymized_learning boolean",
      "excluded_from_benchmarking boolean",
      "consent_status text",
    ]) {
      expect(schema).toContain(column);
    }
  });

  it("tracks document extraction, classification, and consent fields", () => {
    for (const column of [
      "backend_document_category text",
      "extraction_confidence numeric",
      "sensitive_data_detected boolean",
      "delete_after_report_generation boolean",
      "excluded_from_benchmarking boolean",
    ]) {
      expect(schema).toContain(column);
    }
  });

  it("adds BudgetScope metadata, version, and line item fields", () => {
    for (const column of [
      "budget_name text",
      "budget_version text",
      "source_type text",
      "occupied_or_vacant text",
      "version_number integer",
      "cost_code text",
      "csi_division text",
      "normalized_trade text",
      "unit_cost numeric",
      "total_cost numeric",
      "is_allowance boolean",
      "mapping_status text",
      "review_status text",
      "current_budget_id uuid",
      "prior_budget_id uuid",
      "total_cost_variance numeric",
      "recommended_question text",
      "normalized_trade text",
      "review_metadata jsonb",
      "source_budget_line_item_id uuid",
      "cost_per_gross_sf numeric",
      "approved_by_admin_id uuid",
    ]) {
      expect(schema).toContain(column);
    }
  });
});
