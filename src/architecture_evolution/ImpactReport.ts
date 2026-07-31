/**
 * ASA-ARCH-42.0 - ImpactReport Contract (Draft 0.6)
 *
 * Declarative impact analysis schema. Report ≠ Execution / Approval.
 */

import type {
    CompatibilityOutcome,
    ImpactSeverity,
} from "./ArchitectureEvolutionTypes";

export type ImpactReportField =
    | "changed_component"
    | "upstream_dependencies"
    | "downstream_dependencies"
    | "affected_extensions"
    | "affected_contracts"
    | "compatibility_result"
    | "breaking_change"
    | "migration_required"
    | "severity"
    | "freeze_requirement";

export const IMPACT_REPORT_REQUIRED_FIELDS: ReadonlyArray<ImpactReportField> =
    Object.freeze([
        "changed_component",
        "upstream_dependencies",
        "downstream_dependencies",
        "affected_extensions",
        "affected_contracts",
        "compatibility_result",
        "breaking_change",
        "migration_required",
        "severity",
        "freeze_requirement",
    ]);

export interface ImpactReport {
    readonly changed_component: string;
    readonly upstream_dependencies: ReadonlyArray<string>;
    readonly downstream_dependencies: ReadonlyArray<string>;
    readonly affected_extensions: ReadonlyArray<string>;
    readonly affected_contracts: ReadonlyArray<string>;
    readonly compatibility_result: CompatibilityOutcome;
    readonly breaking_change: boolean;
    readonly migration_required: boolean;
    readonly severity: ImpactSeverity;
    readonly freeze_requirement: boolean;
    readonly reportIsNotApproval: true;
    readonly reportIsNotExecution: true;
}

export interface ImpactReportSchemaContract {
    readonly schemaId: "asa.evolution.impact_report.v1";
    readonly requiredFields: ReadonlyArray<ImpactReportField>;
    readonly reportIsNotApproval: true;
}

export function freezeImpactReportSchema(): ImpactReportSchemaContract {
    return Object.freeze({
        schemaId: "asa.evolution.impact_report.v1" as const,
        requiredFields: IMPACT_REPORT_REQUIRED_FIELDS,
        reportIsNotApproval: true as const,
    });
}

export function freezeImpactReport(
    input: Omit<ImpactReport, "reportIsNotApproval" | "reportIsNotExecution">
): ImpactReport {
    return Object.freeze({
        ...input,
        upstream_dependencies: Object.freeze([...input.upstream_dependencies]),
        downstream_dependencies: Object.freeze([
            ...input.downstream_dependencies,
        ]),
        affected_extensions: Object.freeze([...input.affected_extensions]),
        affected_contracts: Object.freeze([...input.affected_contracts]),
        reportIsNotApproval: true as const,
        reportIsNotExecution: true as const,
    });
}

export function validateImpactReportSchema(
    value: unknown
): { readonly ok: true } | { readonly ok: false; readonly reason: string } {
    if (value === null || typeof value !== "object") {
        return { ok: false, reason: "ImpactReport must be an object" };
    }
    const obj = value as Record<string, unknown>;
    for (const field of IMPACT_REPORT_REQUIRED_FIELDS) {
        if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
            return { ok: false, reason: `Missing required field: ${field}` };
        }
    }
    for (const arrField of [
        "upstream_dependencies",
        "downstream_dependencies",
        "affected_extensions",
        "affected_contracts",
    ] as const) {
        if (!Array.isArray(obj[arrField])) {
            return { ok: false, reason: `${arrField} must be an array` };
        }
    }
    if (
        obj.compatibility_result !== "PASS" &&
        obj.compatibility_result !== "FAIL"
    ) {
        return { ok: false, reason: "Invalid compatibility_result" };
    }
    const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (typeof obj.severity !== "string" || !severities.includes(obj.severity)) {
        return { ok: false, reason: "Invalid severity" };
    }
    return { ok: true };
}
