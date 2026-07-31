/**
 * ASA-ARCH-45.0 — ExtensionBoundaryContract
 * Extension existence boundary. No runtime / decision / authority control.
 */

import type { ExtensionIdentifier } from "../types";
import type { ExtensionApprovalReferenceContract } from "./ExtensionApprovalReferenceContract";
import type { ExtensionResponsibilityDeclaration } from "./ExtensionResponsibilityDeclaration";

export interface ExtensionBoundaryContract {
    readonly contractId: "ExtensionBoundaryContract";
    readonly extensionId: ExtensionIdentifier;
    readonly extensionContractReference: string;
    readonly responsibilityDeclaration: ExtensionResponsibilityDeclaration;
    readonly isolationConstraints: readonly string[];
    readonly boundaryApprovalReference: ExtensionApprovalReferenceContract;
    readonly forbidsRuntimeExecutionLogic: true;
    readonly forbidsDecisionLogic: true;
    readonly forbidsAuthorityControl: true;
    readonly forbidsLifecycleMutation: true;
    readonly forbidsSelfCreatedBoundaryApproval: true;
}

export function freezeExtensionBoundaryContract(input: {
    extensionId: ExtensionIdentifier;
    extensionContractReference: string;
    responsibilityDeclaration: ExtensionResponsibilityDeclaration;
    isolationConstraints: readonly string[];
    boundaryApprovalReference: ExtensionApprovalReferenceContract;
}): ExtensionBoundaryContract {
    const contractRef = input.extensionContractReference.trim();
    if (!contractRef) {
        throw new Error("extensionContractReference must be non-empty");
    }
    if (input.boundaryApprovalReference.approvalAuthority !== "HUMAN_ARCHITECT") {
        throw new Error("BoundaryApprovalReference requires HUMAN_ARCHITECT");
    }
    const constraints = Object.freeze(
        input.isolationConstraints.map((c) => {
            const v = c.trim();
            if (!v) {
                throw new Error("isolationConstraints entries must be non-empty");
            }
            return v;
        })
    );
    return Object.freeze({
        contractId: "ExtensionBoundaryContract",
        extensionId: input.extensionId,
        extensionContractReference: contractRef,
        responsibilityDeclaration: input.responsibilityDeclaration,
        isolationConstraints: constraints,
        boundaryApprovalReference: input.boundaryApprovalReference,
        forbidsRuntimeExecutionLogic: true,
        forbidsDecisionLogic: true,
        forbidsAuthorityControl: true,
        forbidsLifecycleMutation: true,
        forbidsSelfCreatedBoundaryApproval: true,
    });
}
