/**
 * ASA-ARCH-45.0 — ExtensionDependencyBoundaryModel
 * Immutable domain model for one-way dependency declaration.
 */

import type {
    DependencyDirection,
    ExtensionDependencyBoundaryContract,
} from "../contracts";

export interface ExtensionDependencyBoundaryModel {
    readonly representsContract: "ExtensionDependencyBoundaryContract";
    readonly dependencyReferenceDeclaration: string;
    readonly allowedDirection: DependencyDirection;
    readonly forbidsExtensionToCoreInternal: true;
    readonly forbidsReverseDependency: true;
    readonly dependencyDirectionOneWay: true;
    readonly immutable: true;
}

export function freezeExtensionDependencyBoundaryModel(input: {
    dependencyReferenceDeclaration: string;
}): ExtensionDependencyBoundaryModel {
    const declaration = input.dependencyReferenceDeclaration.trim();
    if (!declaration) {
        throw new Error("dependencyReferenceDeclaration must be non-empty");
    }
    return Object.freeze({
        representsContract: "ExtensionDependencyBoundaryContract",
        dependencyReferenceDeclaration: declaration,
        allowedDirection: "ASA_BOUNDARY_TO_EXTENSION",
        forbidsExtensionToCoreInternal: true,
        forbidsReverseDependency: true,
        dependencyDirectionOneWay: true,
        immutable: true,
    });
}

export function dependencyBoundaryModelFromContract(
    contract: ExtensionDependencyBoundaryContract
): ExtensionDependencyBoundaryModel {
    return freezeExtensionDependencyBoundaryModel({
        dependencyReferenceDeclaration: contract.dependencyReferenceDeclaration,
    });
}
