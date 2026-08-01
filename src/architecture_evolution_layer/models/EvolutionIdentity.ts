/**
 * ASA-ARCH-46.0 — EvolutionIdentity
 */

import type { ArchitectureIdentifier, EvolutionIdentifier } from "../types";

export interface EvolutionIdentity {
    readonly kind: "EvolutionIdentity";
    readonly evolutionId: EvolutionIdentifier;
    readonly architectureId: ArchitectureIdentifier;
    readonly title: string;
    readonly immutable: true;
    readonly doesNotOwnAuthority: true;
}

export function freezeEvolutionIdentity(input: {
    evolutionId: EvolutionIdentifier;
    architectureId: ArchitectureIdentifier;
    title: string;
}): EvolutionIdentity {
    return Object.freeze({
        kind: "EvolutionIdentity",
        evolutionId: input.evolutionId,
        architectureId: input.architectureId,
        title: input.title.trim(),
        immutable: true,
        doesNotOwnAuthority: true,
    });
}
