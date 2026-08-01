/**
 * ASA-ARCH-46.0 — EvolutionBoundary
 */

import type { EvolutionBoundaryContract } from "../contracts";
import { freezeEvolutionBoundaryContract } from "../contracts";

export interface EvolutionBoundary {
    readonly kind: "EvolutionBoundary";
    readonly contract: EvolutionBoundaryContract;
    readonly immutable: true;
    readonly evolutionWithoutMutation: true;
    readonly doesNotModifyFoundation: true;
}

export function freezeEvolutionBoundary(
    contract: EvolutionBoundaryContract = freezeEvolutionBoundaryContract()
): EvolutionBoundary {
    return Object.freeze({
        kind: "EvolutionBoundary",
        contract,
        immutable: true,
        evolutionWithoutMutation: true,
        doesNotModifyFoundation: true,
    });
}
