/**
 * ASA-ARCH-42.0 - Compatibility Validator Module (Draft 0.6)
 *
 * Compatibility check against existing architecture state.
 * CompatibilityResult ≠ Freeze Approval.
 */

import type { ImpactReport } from "./ImpactReport";
import type { CompatibilityOutcome } from "./ArchitectureEvolutionTypes";

export interface CompatibilityRules {
    readonly forbidCoreBreak: true;
    readonly forbidFrozenBreak: true;
    readonly forbidExtensionBoundaryViolation: true;
    readonly breakingChangeFails: true;
}

export interface ExistingArchitectureState {
    readonly architecture_version: string;
    readonly frozenContractIds: ReadonlyArray<string>;
    readonly coreContractIds: ReadonlyArray<string>;
}

export interface CompatibilityResult {
    readonly outcome: CompatibilityOutcome;
    readonly reasons: ReadonlyArray<string>;
    readonly compatibilityIsNotFreezeApproval: true;
}

export interface CompatibilityValidatorRole {
    readonly roleId: "COMPATIBILITY_VALIDATOR";
    readonly validatesCompatibility: true;
    readonly forbidsApproveFreeze: true;
}

export function freezeCompatibilityRules(): CompatibilityRules {
    return Object.freeze({
        forbidCoreBreak: true as const,
        forbidFrozenBreak: true as const,
        forbidExtensionBoundaryViolation: true as const,
        breakingChangeFails: true as const,
    });
}

export function freezeCompatibilityValidatorRole(): CompatibilityValidatorRole {
    return Object.freeze({
        roleId: "COMPATIBILITY_VALIDATOR" as const,
        validatesCompatibility: true as const,
        forbidsApproveFreeze: true as const,
    });
}

export function validateCompatibility(input: {
    readonly impact: ImpactReport;
    readonly existing: ExistingArchitectureState;
    readonly rules: CompatibilityRules;
    readonly extensionBoundaryViolated?: boolean;
}): CompatibilityResult {
    const reasons: string[] = [];

    if (input.rules.forbidCoreBreak) {
        const coreHit = input.impact.affected_contracts.some((c) =>
            input.existing.coreContractIds.includes(c)
        );
        if (coreHit || input.impact.severity === "CRITICAL") {
            reasons.push("Core compatibility break");
        }
    }
    if (input.rules.forbidFrozenBreak) {
        const frozenHit = input.impact.affected_contracts.some((c) =>
            input.existing.frozenContractIds.includes(c)
        );
        if (frozenHit) {
            reasons.push("Frozen contract compatibility break");
        }
    }
    if (
        input.rules.forbidExtensionBoundaryViolation &&
        input.extensionBoundaryViolated
    ) {
        reasons.push("Extension boundary violation");
    }
    if (input.rules.breakingChangeFails && input.impact.breaking_change) {
        reasons.push("Breaking change");
    }
    if (input.impact.compatibility_result === "FAIL") {
        reasons.push("Impact compatibility_result FAIL");
    }

    const unique = [...new Set(reasons)];
    return Object.freeze({
        outcome: (unique.length === 0 ? "PASS" : "FAIL") as CompatibilityOutcome,
        reasons: Object.freeze(unique),
        compatibilityIsNotFreezeApproval: true as const,
    });
}
