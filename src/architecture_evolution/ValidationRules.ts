/**
 * ASA-ARCH-42.0 - Validation Rules (Draft 0.6)
 *
 * Structural rule set. Evaluation returns PASS/FAIL only.
 * Does not execute architecture mutation or freeze authorization.
 */

import type {
    ValidationOutcome,
    ValidationRuleId,
} from "./ArchitectureEvolutionTypes";
import { hashArtifact } from "./HashIntegrity";

export interface ValidationRuleDefinition {
    readonly id: ValidationRuleId;
    readonly name: string;
    readonly description: string;
}

export interface ValidationRuleSet {
    readonly schemaId: "asa.evolution.validation_rules.v1";
    readonly rules: ReadonlyArray<ValidationRuleDefinition>;
    readonly hash: string;
    readonly recordGenerationIsNotApprovalAuthority: true;
}

export interface ValidationEvaluationRequest {
    readonly attemptsCoreModification: boolean;
    readonly attemptsFrozenContractModification: boolean;
    readonly attemptsAutomaticDecision: boolean;
    readonly attemptsExtensionBoundaryViolation: boolean;
    readonly generatedRecordPresent: boolean;
    readonly treatsRecordAsApprovalAuthority: boolean;
}

export interface ValidationRuleResult {
    readonly ruleId: ValidationRuleId;
    readonly outcome: ValidationOutcome;
    readonly reason: string;
}

export interface ValidationEvaluationResult {
    readonly outcome: ValidationOutcome;
    readonly results: ReadonlyArray<ValidationRuleResult>;
}

const RULES: ReadonlyArray<ValidationRuleDefinition> = Object.freeze([
    Object.freeze({
        id: "RULE-001" as const,
        name: "Core Protection",
        description: "Core Contract Modification = FAIL",
    }),
    Object.freeze({
        id: "RULE-002" as const,
        name: "Frozen Contract Protection",
        description: "Frozen Contract Modification = FAIL",
    }),
    Object.freeze({
        id: "RULE-003" as const,
        name: "Authority Protection",
        description: "Automatic Decision = FAIL",
    }),
    Object.freeze({
        id: "RULE-004" as const,
        name: "Extension Boundary Protection",
        description: "Extension Boundary Violation = FAIL",
    }),
    Object.freeze({
        id: "RULE-005" as const,
        name: "Record Integrity",
        description: "Generated Record Missing = FAIL",
    }),
    Object.freeze({
        id: "RULE-006" as const,
        name: "Authority Separation",
        description: "Record Generation ≠ Approval Authority",
    }),
]);

export function freezeValidationRuleSet(): ValidationRuleSet {
    const rules = RULES;
    return Object.freeze({
        schemaId: "asa.evolution.validation_rules.v1" as const,
        rules,
        hash: hashArtifact(rules),
        recordGenerationIsNotApprovalAuthority: true as const,
    });
}

export function evaluateValidationRules(
    request: ValidationEvaluationRequest
): ValidationEvaluationResult {
    const results: ValidationRuleResult[] = [
        {
            ruleId: "RULE-001",
            outcome: request.attemptsCoreModification ? "FAIL" : "PASS",
            reason: request.attemptsCoreModification
                ? "Core Contract Modification"
                : "Core protected",
        },
        {
            ruleId: "RULE-002",
            outcome: request.attemptsFrozenContractModification
                ? "FAIL"
                : "PASS",
            reason: request.attemptsFrozenContractModification
                ? "Frozen Contract Modification"
                : "Frozen contracts protected",
        },
        {
            ruleId: "RULE-003",
            outcome: request.attemptsAutomaticDecision ? "FAIL" : "PASS",
            reason: request.attemptsAutomaticDecision
                ? "Automatic Decision"
                : "No automatic decision",
        },
        {
            ruleId: "RULE-004",
            outcome: request.attemptsExtensionBoundaryViolation
                ? "FAIL"
                : "PASS",
            reason: request.attemptsExtensionBoundaryViolation
                ? "Extension Boundary Violation"
                : "Extension boundary intact",
        },
        {
            ruleId: "RULE-005",
            outcome: request.generatedRecordPresent ? "PASS" : "FAIL",
            reason: request.generatedRecordPresent
                ? "Generated record present"
                : "Generated Record Missing",
        },
        {
            ruleId: "RULE-006",
            outcome: request.treatsRecordAsApprovalAuthority ? "FAIL" : "PASS",
            reason: request.treatsRecordAsApprovalAuthority
                ? "Record Generation treated as Approval Authority"
                : "Record ≠ Approval Authority",
        },
    ];
    const outcome: ValidationOutcome = results.every((r) => r.outcome === "PASS")
        ? "PASS"
        : "FAIL";
    return Object.freeze({
        outcome,
        results: Object.freeze(results.map((r) => Object.freeze(r))),
    });
}
