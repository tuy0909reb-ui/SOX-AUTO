/**
 * ASA-ARCH-43.0 - Boundary Validator (Draft 0.7)
 */

import {
    freezeBoundaryValidationResult,
    type BoundaryValidationResult,
} from "./ValidationResultContracts";

export interface BoundaryRules {
    readonly forbidCoreWrite: true;
    readonly forbidFrozenWrite: true;
    readonly forbidAuthorityEscalation: true;
    readonly forbidOperationalControl: true;
}

export interface CurrentArchitectureState {
    readonly attemptsCoreWrite: boolean;
    readonly attemptsFrozenWrite: boolean;
    readonly attemptsAuthorityEscalation: boolean;
    readonly attemptsOperationalControl: boolean;
}

export interface BoundaryValidatorRole {
    readonly roleId: "BOUNDARY_VALIDATOR";
    readonly detectsBoundaryViolation: true;
    readonly protectsAuthorityBoundary: true;
}

export function freezeBoundaryRules(): BoundaryRules {
    return Object.freeze({
        forbidCoreWrite: true as const,
        forbidFrozenWrite: true as const,
        forbidAuthorityEscalation: true as const,
        forbidOperationalControl: true as const,
    });
}

export function freezeBoundaryValidatorRole(): BoundaryValidatorRole {
    return Object.freeze({
        roleId: "BOUNDARY_VALIDATOR" as const,
        detectsBoundaryViolation: true as const,
        protectsAuthorityBoundary: true as const,
    });
}

export function validateBoundary(input: {
    readonly id: string;
    readonly target: string;
    readonly rules: BoundaryRules;
    readonly state: CurrentArchitectureState;
    readonly evidence_reference: string;
}): BoundaryValidationResult {
    const violations: string[] = [];
    if (input.rules.forbidCoreWrite && input.state.attemptsCoreWrite) {
        violations.push("Core write boundary violation");
    }
    if (input.rules.forbidFrozenWrite && input.state.attemptsFrozenWrite) {
        violations.push("Frozen contract write boundary violation");
    }
    if (
        input.rules.forbidAuthorityEscalation &&
        input.state.attemptsAuthorityEscalation
    ) {
        violations.push("Authority boundary violation");
    }
    if (
        input.rules.forbidOperationalControl &&
        input.state.attemptsOperationalControl
    ) {
        violations.push("Operational control boundary violation");
    }
    return freezeBoundaryValidationResult({
        id: input.id,
        validator: "BOUNDARY_VALIDATOR",
        target: input.target,
        rule_reference: "RULE-102",
        status: violations.length === 0 ? "PASS" : "FAIL",
        violations,
        evidence_reference: input.evidence_reference,
    });
}
