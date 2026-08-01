/**
 * ASA-ARCH-46.0 — EvolutionBoundaryContract
 */

export interface EvolutionBoundaryContract {
    readonly contractId: "EvolutionBoundaryContract";
    readonly forbidsFoundationModification: true;
    readonly forbidsFrozenChapterModification: true;
    readonly forbidsHistoricalRewrite: true;
    readonly forbidsUnrestrictedExpansion: true;
    readonly requiresDeclaredContracts: true;
    readonly evolutionWithoutMutation: true;
}

export function freezeEvolutionBoundaryContract(): EvolutionBoundaryContract {
    return Object.freeze({
        contractId: "EvolutionBoundaryContract",
        forbidsFoundationModification: true,
        forbidsFrozenChapterModification: true,
        forbidsHistoricalRewrite: true,
        forbidsUnrestrictedExpansion: true,
        requiresDeclaredContracts: true,
        evolutionWithoutMutation: true,
    });
}
