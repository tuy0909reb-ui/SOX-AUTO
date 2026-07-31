/**
 * ASA-ARCH-43.0 - Validation Rules RULE-101…107 (Draft 0.7)
 */

import type {
    ValidationRuleId,
    ValidationStatus,
} from "./ArchitectureValidationTypes";
import { hashArtifact } from "./HashIntegrity";

export interface ValidationRuleDefinition {
    readonly id: ValidationRuleId;
    readonly name: string;
    readonly description: string;
}

export interface ValidationRuleSet {
    readonly schemaId: "asa.validation.rules.v1";
    readonly rules: ReadonlyArray<ValidationRuleDefinition>;
    readonly hash: string;
    readonly noDecisionAuthority: true;
}

export interface RuleEvaluationRequest {
    readonly contractIntegrityOk: boolean;
    readonly boundaryIntegrityOk: boolean;
    readonly freezeIntegrityOk: boolean;
    readonly authorityProtected: boolean;
    readonly reportIntegrityOk: boolean;
    readonly evidenceHashOk: boolean;
    readonly ruleSetHashMatchesApproved: boolean;
    readonly approvedRuleEvolutionPresent: boolean;
}

export interface RuleResult {
    readonly ruleId: ValidationRuleId;
    readonly status: ValidationStatus;
    readonly reason: string;
}

export interface RuleEngineEvaluation {
    readonly status: ValidationStatus;
    readonly results: ReadonlyArray<RuleResult>;
}

const RULES: ReadonlyArray<ValidationRuleDefinition> = Object.freeze([
    Object.freeze({
        id: "RULE-101" as const,
        name: "Contract Integrity",
        description: "Contract mismatch vs frozen/registered snapshot = FAIL",
    }),
    Object.freeze({
        id: "RULE-102" as const,
        name: "Boundary Integrity",
        description: "Boundary violation = FAIL",
    }),
    Object.freeze({
        id: "RULE-103" as const,
        name: "Freeze Integrity",
        description: "Frozen artifact hash mismatch = FAIL",
    }),
    Object.freeze({
        id: "RULE-104" as const,
        name: "Authority Protection",
        description: "Validation modification / decision attempt = FAIL",
    }),
    Object.freeze({
        id: "RULE-105" as const,
        name: "Report Integrity",
        description: "Missing or inconsistent report evidence = FAIL",
    }),
    Object.freeze({
        id: "RULE-106" as const,
        name: "Evidence Hash Integrity",
        description: "Evidence hash verification failure = FAIL",
    }),
    Object.freeze({
        id: "RULE-107" as const,
        name: "Validation Rule Integrity",
        description:
            "Rule hash difference without approved rule evolution = FAIL",
    }),
]);

export function freezeValidationRuleSet(): ValidationRuleSet {
    return Object.freeze({
        schemaId: "asa.validation.rules.v1" as const,
        rules: RULES,
        hash: hashArtifact(RULES),
        noDecisionAuthority: true as const,
    });
}

export function evaluateValidationRules(
    request: RuleEvaluationRequest
): RuleEngineEvaluation {
    const results: RuleResult[] = [
        {
            ruleId: "RULE-101",
            status: request.contractIntegrityOk ? "PASS" : "FAIL",
            reason: request.contractIntegrityOk
                ? "Contract integrity ok"
                : "Contract integrity violation",
        },
        {
            ruleId: "RULE-102",
            status: request.boundaryIntegrityOk ? "PASS" : "FAIL",
            reason: request.boundaryIntegrityOk
                ? "Boundary integrity ok"
                : "Boundary integrity violation",
        },
        {
            ruleId: "RULE-103",
            status: request.freezeIntegrityOk ? "PASS" : "FAIL",
            reason: request.freezeIntegrityOk
                ? "Freeze integrity ok"
                : "Freeze integrity violation",
        },
        {
            ruleId: "RULE-104",
            status: request.authorityProtected ? "PASS" : "FAIL",
            reason: request.authorityProtected
                ? "Authority protected"
                : "Authority protection violation",
        },
        {
            ruleId: "RULE-105",
            status: request.reportIntegrityOk ? "PASS" : "FAIL",
            reason: request.reportIntegrityOk
                ? "Report integrity ok"
                : "Report integrity violation",
        },
        {
            ruleId: "RULE-106",
            status: request.evidenceHashOk ? "PASS" : "FAIL",
            reason: request.evidenceHashOk
                ? "Evidence hash ok"
                : "Evidence hash integrity violation",
        },
        {
            ruleId: "RULE-107",
            status:
                request.ruleSetHashMatchesApproved ||
                request.approvedRuleEvolutionPresent
                    ? "PASS"
                    : "FAIL",
            reason:
                request.ruleSetHashMatchesApproved ||
                request.approvedRuleEvolutionPresent
                    ? "Validation rule integrity ok"
                    : "Validation rule hash difference without approved evolution",
        },
    ];
    const status: ValidationStatus = results.every((r) => r.status === "PASS")
        ? "PASS"
        : "FAIL";
    return Object.freeze({
        status,
        results: Object.freeze(results.map((r) => Object.freeze(r))),
    });
}
