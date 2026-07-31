/**
 * ASA-ARCH-23.0 — Construction Selection (Draft 1.4)
 *
 * Declarative type definitions only.
 *
 * SHALL NOT contain runtime, registry, discovery, selection, resolution,
 * loading, scheduling, or dependency-analysis semantics.
 */

/** Stable construction selection identity (CSE-1). */
export type SelectionIdentity = string;

/**
 * Declarative reference to a Declarative Discovery Result (architectural input).
 * Identity only — no discovery / traversal / loading.
 */
export interface DeclarativeDiscoveryResultReference {
    readonly discoveryResultId: string;
}

/**
 * Declarative Selected Reference (CSE-3).
 * References an existing Construction Definition Reference within the
 * Declarative Discovery Result — no duplication of definition contents.
 */
export interface SelectedReference {
    readonly definitionReferenceId: string;
}

/**
 * Declarative selection metadata (CSE-4).
 * Identifier / name / version / ownership / compatibility — no runtime info.
 */
export interface SelectionMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly ownership: string;
    readonly compatibilityInformation: string;
}

/**
 * Declarative selection compatibility metadata (CSE-5).
 */
export interface SelectionCompatibility {
    readonly version: string;
    readonly contract: string;
    readonly preservesFrozenContractCompatibility: true;
    readonly preservesDiscoveryResultCompatibility: true;
    readonly preservesPriorSelectionCompatibility: true;
    readonly preservesSelectedReferenceValidity: true;
}

/**
 * Declarative selection integrity metadata (CSE-7).
 * Declares integrity requirements only — no verification algorithm beyond
 * structural checks performed by ConstructionSelectionBuilder.
 */
export interface SelectionIntegrity {
    readonly requiresValidSelectionIdentity: true;
    readonly requiresValidSelectedReferences: true;
    readonly requiresSelectionConsistency: true;
}

/**
 * Declarative Construction Selection structure (CSE-2 / CSE-6).
 * Describes selected references from a Declarative Discovery Result —
 * not how selection is performed.
 */
export interface ConstructionSelection {
    readonly selectionId: SelectionIdentity;
    readonly discoveryResultReference: DeclarativeDiscoveryResultReference;
    readonly selectedReferences: readonly SelectedReference[];
    readonly metadata: SelectionMetadata;
    readonly compatibility: SelectionCompatibility;
    readonly integrity: SelectionIntegrity;
}
