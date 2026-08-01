/**
 * ASA-ARCH-46.0 — DependencyDirectionValidation
 */

import {
    freezeEvolutionDependencyBoundaryContract,
    type EvolutionDependencyBoundaryContract,
} from "../contracts";
import type { EvolutionValidationInspectionResult } from "../interfaces";
import type { EvolutionRegistryRecord } from "../models";
import { freezeInspectionResult } from "./inspectionResult";

export function inspectDependencyDirection(
    contract: EvolutionDependencyBoundaryContract = freezeEvolutionDependencyBoundaryContract(),
    record?: EvolutionRegistryRecord
): EvolutionValidationInspectionResult {
    const findings: string[] = [];
    if (
        contract.allowedDependencyDirection !==
        "Future→Ch46→Ch45→Foundation"
    ) {
        findings.push("allowedDependencyDirection mismatch");
    }
    if (!contract.forbidsFoundationDependingOnEvolution) {
        findings.push("forbidsFoundationDependingOnEvolution must be true");
    }
    if (!contract.forbidsReverseDependencyIntoFoundation) {
        findings.push("forbidsReverseDependencyIntoFoundation must be true");
    }
    if (contract.requiresExtensionBoundaryProvider !== "ASA-ARCH-45.0") {
        findings.push("requiresExtensionBoundaryProvider must be ASA-ARCH-45.0");
    }
    if (contract.requiresFoundationReference !== "ASA-FOUNDATION-1.0") {
        findings.push("requiresFoundationReference must be ASA-FOUNDATION-1.0");
    }
    if (record) {
        if (record.dependsOnExtensionBoundary !== "ASA-ARCH-45.0") {
            findings.push("record missing Ch45 dependency");
        }
        if (record.dependsOnFoundation !== "ASA-FOUNDATION-1.0") {
            findings.push("record missing Foundation dependency");
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
