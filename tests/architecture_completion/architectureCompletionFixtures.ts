import {
    REQUIRED_COMPLETION_LAYERS,
    asArchitectureStateHash,
    asEvidenceReference,
    asFreezeReference,
    asRepositoryBaselineReference,
    asVerificationReference,
    freezeArchitectureState,
    type ArchitectureState,
} from "../../src/architecture_completion";

export function sampleCompleteArchitectureState(
    overrides?: Partial<{
        architectureStateHash: string;
        completedLayers: readonly string[];
    }>
): ArchitectureState {
    return freezeArchitectureState({
        architectureStateHash: asArchitectureStateHash(
            overrides?.architectureStateHash ?? "STATE-HASH-50-001"
        ),
        requiredLayers: REQUIRED_COMPLETION_LAYERS,
        completedLayers: overrides?.completedLayers ?? REQUIRED_COMPLETION_LAYERS,
        evidenceReferences: [
            asEvidenceReference("EVID-FOUNDATION-1.0"),
            asEvidenceReference("EVID-ARCH-49.0"),
        ],
        verificationReferences: [
            asVerificationReference("ASA-VERIFY-ARCH-49.0-001"),
        ],
        freezeReferences: [
            asFreezeReference("ASA-FREEZE-ARCH-49.0-001"),
            asFreezeReference("ASA-FOUNDATION-1.0-FROZEN"),
        ],
        repositoryBaselineReferences: [
            asRepositoryBaselineReference("ASA-ARCH-49.0-FROZEN"),
            asRepositoryBaselineReference("ASA-FOUNDATION-1.0-FROZEN"),
        ],
        contractsEstablished: true,
        dependencyIntegrityPreserved: true,
        frozenBaselinesPreserved: true,
    });
}

export function sampleIncompleteArchitectureState(): ArchitectureState {
    return freezeArchitectureState({
        architectureStateHash: asArchitectureStateHash("STATE-HASH-50-INCOMPLETE"),
        requiredLayers: REQUIRED_COMPLETION_LAYERS,
        completedLayers: [
            "ASA-FOUNDATION-1.0",
            "ASA-ARCH-45.0",
            "ASA-ARCH-46.0",
        ],
        evidenceReferences: [asEvidenceReference("EVID-PARTIAL")],
        verificationReferences: [
            asVerificationReference("ASA-VERIFY-PARTIAL"),
        ],
        freezeReferences: [asFreezeReference("ASA-FREEZE-PARTIAL")],
        repositoryBaselineReferences: [
            asRepositoryBaselineReference("PARTIAL-ANCHOR"),
        ],
        contractsEstablished: true,
        dependencyIntegrityPreserved: true,
        frozenBaselinesPreserved: true,
    });
}
