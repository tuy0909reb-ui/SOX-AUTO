/**
 * ASA-ARCH-43.0 - Validation Result Contracts (Draft 0.7)
 */

import type { ValidationRuleId, ValidationStatus } from "./ArchitectureValidationTypes";

export interface ContractValidationResult {
    readonly id: string;
    readonly validator: "CONTRACT_VALIDATOR";
    readonly target: string;
    readonly rule_reference: ValidationRuleId;
    readonly status: ValidationStatus;
    readonly violations: ReadonlyArray<string>;
    readonly evidence_reference: string;
    readonly resultIsNotDecisionAuthority: true;
}

export interface BoundaryValidationResult {
    readonly id: string;
    readonly validator: "BOUNDARY_VALIDATOR";
    readonly target: string;
    readonly rule_reference: ValidationRuleId;
    readonly status: ValidationStatus;
    readonly violations: ReadonlyArray<string>;
    readonly evidence_reference: string;
    readonly resultIsNotDecisionAuthority: true;
}

export interface FreezeIntegrityResult {
    readonly id: string;
    readonly freeze_reference: string;
    readonly hash_before: string;
    readonly hash_current: string;
    readonly rule_reference: ValidationRuleId;
    readonly status: ValidationStatus;
    readonly evidence_reference: string;
    readonly resultIsNotDecisionAuthority: true;
}

export function freezeContractValidationResult(
    input: Omit<ContractValidationResult, "resultIsNotDecisionAuthority">
): ContractValidationResult {
    return Object.freeze({
        ...input,
        violations: Object.freeze([...input.violations]),
        resultIsNotDecisionAuthority: true as const,
    });
}

export function freezeBoundaryValidationResult(
    input: Omit<BoundaryValidationResult, "resultIsNotDecisionAuthority">
): BoundaryValidationResult {
    return Object.freeze({
        ...input,
        violations: Object.freeze([...input.violations]),
        resultIsNotDecisionAuthority: true as const,
    });
}

export function freezeFreezeIntegrityResult(
    input: Omit<FreezeIntegrityResult, "resultIsNotDecisionAuthority">
): FreezeIntegrityResult {
    return Object.freeze({
        ...input,
        resultIsNotDecisionAuthority: true as const,
    });
}

export function validateResultSchema(
    value: unknown,
    kind: "contract" | "boundary" | "freeze"
): { readonly ok: true } | { readonly ok: false; readonly reason: string } {
    if (value === null || typeof value !== "object") {
        return { ok: false, reason: "Result must be an object" };
    }
    const obj = value as Record<string, unknown>;
    if (kind === "freeze") {
        for (const f of [
            "id",
            "freeze_reference",
            "hash_before",
            "hash_current",
            "rule_reference",
            "status",
            "evidence_reference",
        ]) {
            if (!(f in obj) || obj[f] === undefined || obj[f] === null) {
                return { ok: false, reason: `Missing required field: ${f}` };
            }
        }
        return { ok: true };
    }
    for (const f of [
        "id",
        "validator",
        "target",
        "rule_reference",
        "status",
        "violations",
        "evidence_reference",
    ]) {
        if (!(f in obj) || obj[f] === undefined || obj[f] === null) {
            return { ok: false, reason: `Missing required field: ${f}` };
        }
    }
    if (!Array.isArray(obj.violations)) {
        return { ok: false, reason: "violations must be an array" };
    }
    return { ok: true };
}
