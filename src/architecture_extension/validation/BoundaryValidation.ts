/**
 * ASA-ARCH-45.0 — BoundaryValidation
 * Read-only structural inspection of Extension boundary declarations.
 */

import type { ExtensionBoundaryContract } from "../contracts";
import type { ExtensionValidationInspectionResult } from "../interfaces";
import type { ExtensionBoundary } from "../models";
import { freezeInspectionResult } from "./inspectionResult";

export function validateBoundaryModel(
    boundary: ExtensionBoundary
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!boundary.immutable) {
        findings.push("Boundary model must be immutable");
    }
    if (!boundary.forbidsRuntimeExecutionLogic) {
        findings.push("Boundary must forbid runtime execution logic");
    }
    if (!boundary.forbidsDecisionLogic) {
        findings.push("Boundary must forbid decision logic");
    }
    if (!boundary.forbidsAuthorityControl) {
        findings.push("Boundary must forbid authority control");
    }
    if (!boundary.forbidsLifecycleMutation) {
        findings.push("Boundary must forbid lifecycle mutation");
    }
    if (
        boundary.boundaryApprovalAssociation.extensionId !==
        boundary.extensionId
    ) {
        findings.push("Boundary approval association extensionId mismatch");
    }
    if (
        boundary.boundaryApprovalAssociation.approvalAuthority !==
        "HUMAN_ARCHITECT"
    ) {
        findings.push("Boundary approval requires HUMAN_ARCHITECT");
    }
    if (!boundary.responsibilityDeclaration.immutable) {
        findings.push("Embedded responsibility declaration must be immutable");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateBoundaryContract(
    contract: ExtensionBoundaryContract
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (contract.contractId !== "ExtensionBoundaryContract") {
        findings.push("Invalid boundary contractId");
    }
    if (!contract.forbidsRuntimeExecutionLogic) {
        findings.push("Boundary contract must forbid runtime execution logic");
    }
    if (!contract.forbidsDecisionLogic) {
        findings.push("Boundary contract must forbid decision logic");
    }
    if (
        contract.boundaryApprovalReference.approvalAuthority !==
        "HUMAN_ARCHITECT"
    ) {
        findings.push("BoundaryApprovalReference requires HUMAN_ARCHITECT");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
