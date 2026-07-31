/**
 * ASA-ARCH-45.0 — ExtensionDependencyBoundaryContract
 * One-way dependency: ASA Boundary → Extension. Reverse prohibited.
 */

export type DependencyDirection = "ASA_BOUNDARY_TO_EXTENSION";

export interface ExtensionDependencyBoundaryContract {
    readonly contractId: "ExtensionDependencyBoundaryContract";
    readonly dependencyReferenceDeclaration: string;
    readonly allowedDirection: DependencyDirection;
    readonly forbidsExtensionToCoreInternal: true;
    readonly forbidsReverseDependency: true;
    readonly dependencyDirectionOneWay: true;
}

export function freezeExtensionDependencyBoundaryContract(input: {
    dependencyReferenceDeclaration: string;
}): ExtensionDependencyBoundaryContract {
    const declaration = input.dependencyReferenceDeclaration.trim();
    if (!declaration) {
        throw new Error("dependencyReferenceDeclaration must be non-empty");
    }
    return Object.freeze({
        contractId: "ExtensionDependencyBoundaryContract",
        dependencyReferenceDeclaration: declaration,
        allowedDirection: "ASA_BOUNDARY_TO_EXTENSION",
        forbidsExtensionToCoreInternal: true,
        forbidsReverseDependency: true,
        dependencyDirectionOneWay: true,
    });
}
