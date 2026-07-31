/**
 * ASA-ARCH-45.0 — DependencyValidation
 * Read-only dependency direction / reverse-dependency inspection.
 */

import type { ExtensionDependencyBoundaryContract } from "../contracts";
import type { ExtensionValidationInspectionResult } from "../interfaces";
import type { ExtensionDependencyBoundaryModel } from "../models";
import type { BoundaryRelationshipReference } from "../references";
import { freezeInspectionResult } from "./inspectionResult";

export function validateDependencyBoundaryContract(
    contract: ExtensionDependencyBoundaryContract
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (contract.allowedDirection !== "ASA_BOUNDARY_TO_EXTENSION") {
        findings.push("Dependency direction must be ASA_BOUNDARY_TO_EXTENSION");
    }
    if (!contract.forbidsReverseDependency) {
        findings.push("Contract must forbid reverse dependency");
    }
    if (!contract.forbidsExtensionToCoreInternal) {
        findings.push("Contract must forbid Extension → Core internal");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateDependencyBoundaryModel(
    model: ExtensionDependencyBoundaryModel
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!model.immutable) {
        findings.push("Dependency model must be immutable");
    }
    if (model.allowedDirection !== "ASA_BOUNDARY_TO_EXTENSION") {
        findings.push("Dependency model direction invalid");
    }
    if (!model.forbidsReverseDependency) {
        findings.push("Dependency model must forbid reverse dependency");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateBoundaryRelationshipReference(
    reference: BoundaryRelationshipReference
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (reference.direction !== "ASA_BOUNDARY_TO_EXTENSION") {
        findings.push("Boundary relationship direction invalid");
    }
    if (reference.fromBoundary !== "ASA_BOUNDARY") {
        findings.push("Boundary relationship fromBoundary invalid");
    }
    if (!reference.forbidsReverseDependency) {
        findings.push("Boundary relationship must forbid reverse dependency");
    }
    if (!reference.immutable || !reference.readOnly) {
        findings.push("Boundary relationship must be immutable read-only");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

/**
 * Detect reverse-dependency declarations in free-form dependency text.
 */
export function detectReverseDependencyDeclaration(
    declaration: string
): ExtensionValidationInspectionResult {
    const normalized = declaration.toUpperCase();
    const findings: string[] = [];
    if (
        normalized.includes("EXTENSION") &&
        normalized.includes("ASA CORE INTERNAL")
    ) {
        findings.push("Reverse dependency declaration detected");
    }
    if (normalized.includes("REVERSE DEPENDENCY ALLOWED")) {
        findings.push("Explicit reverse dependency allowance detected");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
