/**
 * ASA-ARCH-50.0 — ArchitectureState（immutable input for completion evaluation）
 */

import type {
    ArchitectureStateHash,
    EvidenceReference,
    FreezeReference,
    RepositoryBaselineReference,
    VerificationReference,
} from "../types";

export interface ArchitectureState {
    readonly kind: "ArchitectureState";
    readonly architectureStateHash: ArchitectureStateHash;
    readonly requiredLayers: readonly string[];
    readonly completedLayers: readonly string[];
    readonly evidenceReferences: readonly EvidenceReference[];
    readonly verificationReferences: readonly VerificationReference[];
    readonly freezeReferences: readonly FreezeReference[];
    readonly repositoryBaselineReferences: readonly RepositoryBaselineReference[];
    readonly contractsEstablished: boolean;
    readonly dependencyIntegrityPreserved: boolean;
    readonly frozenBaselinesPreserved: boolean;
    readonly immutable: true;
    readonly doesNotDecide: true;
}

export function freezeArchitectureState(input: {
    architectureStateHash: ArchitectureStateHash;
    requiredLayers: readonly string[];
    completedLayers: readonly string[];
    evidenceReferences: readonly EvidenceReference[];
    verificationReferences: readonly VerificationReference[];
    freezeReferences: readonly FreezeReference[];
    repositoryBaselineReferences: readonly RepositoryBaselineReference[];
    contractsEstablished: boolean;
    dependencyIntegrityPreserved: boolean;
    frozenBaselinesPreserved: boolean;
}): ArchitectureState {
    return Object.freeze({
        kind: "ArchitectureState",
        architectureStateHash: input.architectureStateHash,
        requiredLayers: Object.freeze(
            [...input.requiredLayers].map((s) => s.trim()).filter(Boolean).sort()
        ),
        completedLayers: Object.freeze(
            [...input.completedLayers]
                .map((s) => s.trim())
                .filter(Boolean)
                .sort()
        ),
        evidenceReferences: Object.freeze([...input.evidenceReferences]),
        verificationReferences: Object.freeze([
            ...input.verificationReferences,
        ]),
        freezeReferences: Object.freeze([...input.freezeReferences]),
        repositoryBaselineReferences: Object.freeze([
            ...input.repositoryBaselineReferences,
        ]),
        contractsEstablished: input.contractsEstablished,
        dependencyIntegrityPreserved: input.dependencyIntegrityPreserved,
        frozenBaselinesPreserved: input.frozenBaselinesPreserved,
        immutable: true,
        doesNotDecide: true,
    });
}
