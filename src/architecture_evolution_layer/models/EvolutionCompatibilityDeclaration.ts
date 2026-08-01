/**
 * ASA-ARCH-46.0 — EvolutionCompatibilityDeclaration
 */

import type {
    ArchitectureIdentifier,
    CompatibilityDeclarationStatus,
} from "../types";

export interface EvolutionCompatibilityDeclaration {
    readonly kind: "EvolutionCompatibilityDeclaration";
    readonly targetArchitectureId: ArchitectureIdentifier;
    readonly status: CompatibilityDeclarationStatus;
    readonly immutable: true;
    readonly isDeclarationOnly: true;
    readonly doesNotDecide: true;
}

export function freezeEvolutionCompatibilityDeclaration(input: {
    targetArchitectureId: ArchitectureIdentifier;
    status: CompatibilityDeclarationStatus;
}): EvolutionCompatibilityDeclaration {
    return Object.freeze({
        kind: "EvolutionCompatibilityDeclaration",
        targetArchitectureId: input.targetArchitectureId,
        status: input.status,
        immutable: true,
        isDeclarationOnly: true,
        doesNotDecide: true,
    });
}
