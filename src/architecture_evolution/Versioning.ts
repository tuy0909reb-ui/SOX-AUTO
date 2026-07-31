/**
 * ASA-ARCH-42.0 - Versioning Strategy (Draft 0.6)
 *
 * Architecture Chapter Version ≠ Contract Version ≠ Record Version.
 */

export interface EvolutionVersionSet {
    readonly architectureVersion: string;
    readonly contractVersion: string;
    readonly proposalVersion: string;
    readonly recordVersion: string;
    readonly architectureChapterVersionIsNotContractVersion: true;
    readonly architectureChapterVersionIsNotRecordVersion: true;
    readonly contractVersionIsNotRecordVersion: true;
}

export type VersionChangeClass = "MAJOR" | "MINOR" | "PATCH";

export interface VersioningPolicy {
    readonly majorMeansArchitectureBreakingChange: true;
    readonly minorMeansCompatibleEvolution: true;
    readonly patchMeansDocumentationOrMetadataChange: true;
    readonly updateOrder: ReadonlyArray<
        "VERSION_INCREASE" | "SNAPSHOT_CREATION" | "ANALYSIS" | "APPROVAL"
    >;
}

export function freezeVersioningPolicy(): VersioningPolicy {
    return Object.freeze({
        majorMeansArchitectureBreakingChange: true as const,
        minorMeansCompatibleEvolution: true as const,
        patchMeansDocumentationOrMetadataChange: true as const,
        updateOrder: Object.freeze([
            "VERSION_INCREASE",
            "SNAPSHOT_CREATION",
            "ANALYSIS",
            "APPROVAL",
        ] as const),
    });
}

export function freezeEvolutionVersionSet(input: {
    readonly architectureVersion: string;
    readonly contractVersion: string;
    readonly proposalVersion: string;
    readonly recordVersion: string;
}): EvolutionVersionSet {
    return Object.freeze({
        ...input,
        architectureChapterVersionIsNotContractVersion: true as const,
        architectureChapterVersionIsNotRecordVersion: true as const,
        contractVersionIsNotRecordVersion: true as const,
    });
}
