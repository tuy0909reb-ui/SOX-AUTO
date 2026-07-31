/**
 * ASA-ARCH-45.0 — BoundaryRelationshipReference
 * Immutable ASA Boundary → Extension relationship reference.
 * Reverse dependency is forbidden.
 */

import type { ExtensionDependencyBoundaryContract } from "../contracts";
import type { ExtensionDependencyBoundaryModel } from "../models";
import type { ExtensionIdentifier } from "../types";

export type BoundaryRelationshipDirection = "ASA_BOUNDARY_TO_EXTENSION";

export interface BoundaryRelationshipReference {
    readonly referenceKind: "BoundaryRelationshipReference";
    readonly fromBoundary: "ASA_BOUNDARY";
    readonly toExtension: ExtensionIdentifier;
    readonly direction: BoundaryRelationshipDirection;
    readonly dependencyReferenceDeclaration: string;
    readonly readOnly: true;
    readonly cannotModifySource: true;
    readonly forbidsReverseDependency: true;
    readonly forbidsExtensionToCoreInternal: true;
    readonly doesNotOwnAuthority: true;
    readonly immutable: true;
}

export function freezeBoundaryRelationshipReference(input: {
    toExtension: ExtensionIdentifier;
    dependencyReferenceDeclaration: string;
}): BoundaryRelationshipReference {
    const declaration = input.dependencyReferenceDeclaration.trim();
    if (!declaration) {
        throw new Error("dependencyReferenceDeclaration must be non-empty");
    }
    return Object.freeze({
        referenceKind: "BoundaryRelationshipReference",
        fromBoundary: "ASA_BOUNDARY",
        toExtension: input.toExtension,
        direction: "ASA_BOUNDARY_TO_EXTENSION",
        dependencyReferenceDeclaration: declaration,
        readOnly: true,
        cannotModifySource: true,
        forbidsReverseDependency: true,
        forbidsExtensionToCoreInternal: true,
        doesNotOwnAuthority: true,
        immutable: true,
    });
}

export function boundaryRelationshipReferenceFromDependencyContract(
    toExtension: ExtensionIdentifier,
    contract: ExtensionDependencyBoundaryContract
): BoundaryRelationshipReference {
    return freezeBoundaryRelationshipReference({
        toExtension,
        dependencyReferenceDeclaration: contract.dependencyReferenceDeclaration,
    });
}

export function boundaryRelationshipReferenceFromDependencyModel(
    toExtension: ExtensionIdentifier,
    model: ExtensionDependencyBoundaryModel
): BoundaryRelationshipReference {
    return freezeBoundaryRelationshipReference({
        toExtension,
        dependencyReferenceDeclaration: model.dependencyReferenceDeclaration,
    });
}
