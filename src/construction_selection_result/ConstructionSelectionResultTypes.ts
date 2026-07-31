/**
 * ASA-ARCH-24.0 — Construction Selection Result (Draft 1.1)
 *
 * Declarative type definitions only.
 *
 * Result contents reuse Chapter 23 SelectedReference — not redefined here.
 *
 * SHALL NOT contain runtime, discovery, selection, resolution, binding,
 * loading, scheduling, or dependency-analysis semantics.
 */

import type { SelectedReference } from "../construction_selection/ConstructionSelectionTypes";

/** Stable construction selection result identity (CSR-1). */
export type ResultIdentity = string;

/**
 * Declarative result metadata (CSR-4).
 * Identifier / name / version / ownership / compatibility — no runtime info.
 */
export interface ResultMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly ownership: string;
    readonly compatibilityInformation: string;
}

/**
 * Declarative result compatibility metadata (CSR-5).
 */
export interface ResultCompatibility {
    readonly version: string;
    readonly contract: string;
    readonly preservesFrozenContractCompatibility: true;
    readonly preservesSelectedReferenceCompatibility: true;
    readonly preservesPriorResultCompatibility: true;
    readonly preservesResultElementValidity: true;
}

/**
 * Declarative result integrity metadata (CSR-7).
 * Declares integrity requirements only — no verification algorithm beyond
 * structural checks performed by ConstructionSelectionResultBuilder.
 */
export interface ResultIntegrity {
    readonly requiresValidResultIdentity: true;
    readonly requiresValidResultMetadata: true;
    readonly requiresValidResultContents: true;
    readonly requiresValidSelectedReferences: true;
    readonly requiresResultConsistency: true;
}

/**
 * Declarative Construction Selection Result structure (CSR-2 / CSR-3 / CSR-6).
 * Result contents are exclusively Chapter 23 Selected References.
 */
export interface ConstructionSelectionResult {
    readonly resultId: ResultIdentity;
    readonly metadata: ResultMetadata;
    readonly contents: readonly SelectedReference[];
    readonly compatibility: ResultCompatibility;
    readonly integrity: ResultIntegrity;
}

/** Re-export Chapter 23 SelectedReference for consumers of this package. */
export type { SelectedReference };
