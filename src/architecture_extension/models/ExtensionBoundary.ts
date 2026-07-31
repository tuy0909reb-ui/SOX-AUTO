/**
 * ASA-ARCH-45.0 — ExtensionBoundary
 * Immutable domain model for Extension existence boundary declaration.
 */

import type { ExtensionBoundaryContract } from "../contracts";
import type { ExtensionIdentifier } from "../types";
import type { ExtensionApprovalReferenceAssociation } from "./ExtensionApprovalReferenceAssociation";
import { approvalReferenceAssociationFromContract } from "./ExtensionApprovalReferenceAssociation";
import type { ExtensionResponsibilityDeclarationModel } from "./ExtensionResponsibilityDeclarationModel";
import { responsibilityDeclarationModelFromContract } from "./ExtensionResponsibilityDeclarationModel";

export interface ExtensionBoundary {
    readonly representsContract: "ExtensionBoundaryContract";
    readonly extensionId: ExtensionIdentifier;
    readonly extensionContractReference: string;
    readonly responsibilityDeclaration: ExtensionResponsibilityDeclarationModel;
    readonly isolationConstraints: readonly string[];
    readonly boundaryApprovalAssociation: ExtensionApprovalReferenceAssociation;
    readonly forbidsRuntimeExecutionLogic: true;
    readonly forbidsDecisionLogic: true;
    readonly forbidsAuthorityControl: true;
    readonly forbidsLifecycleMutation: true;
    readonly forbidsSelfCreatedBoundaryApproval: true;
    readonly immutable: true;
}

export function freezeExtensionBoundary(input: {
    extensionId: ExtensionIdentifier;
    extensionContractReference: string;
    responsibilityDeclaration: ExtensionResponsibilityDeclarationModel;
    isolationConstraints: readonly string[];
    boundaryApprovalAssociation: ExtensionApprovalReferenceAssociation;
}): ExtensionBoundary {
    const contractRef = input.extensionContractReference.trim();
    if (!contractRef) {
        throw new Error("extensionContractReference must be non-empty");
    }
    if (input.boundaryApprovalAssociation.extensionId !== input.extensionId) {
        throw new Error(
            "boundaryApprovalAssociation.extensionId must match boundary extensionId"
        );
    }
    if (!input.responsibilityDeclaration.immutable) {
        throw new Error("responsibilityDeclaration must be immutable");
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
        representsContract: "ExtensionBoundaryContract",
        extensionId: input.extensionId,
        extensionContractReference: contractRef,
        responsibilityDeclaration: input.responsibilityDeclaration,
        isolationConstraints: constraints,
        boundaryApprovalAssociation: input.boundaryApprovalAssociation,
        forbidsRuntimeExecutionLogic: true,
        forbidsDecisionLogic: true,
        forbidsAuthorityControl: true,
        forbidsLifecycleMutation: true,
        forbidsSelfCreatedBoundaryApproval: true,
        immutable: true,
    });
}

export function extensionBoundaryFromContract(
    contract: ExtensionBoundaryContract
): ExtensionBoundary {
    return freezeExtensionBoundary({
        extensionId: contract.extensionId,
        extensionContractReference: contract.extensionContractReference,
        responsibilityDeclaration: responsibilityDeclarationModelFromContract(
            contract.responsibilityDeclaration
        ),
        isolationConstraints: contract.isolationConstraints,
        boundaryApprovalAssociation: approvalReferenceAssociationFromContract(
            contract.extensionId,
            contract.boundaryApprovalReference
        ),
    });
}
