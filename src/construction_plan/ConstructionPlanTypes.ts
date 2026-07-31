/**
 * ASA-ARCH-25.0 - Construction Plan (Draft 0.3)
 *
 * Declarative type definitions only.
 *
 * Plan contents reuse Chapter 23 SelectedReference (via Construction Selection
 * Result) - not redefined here.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { SelectedReference } from "../construction_selection/ConstructionSelectionTypes";

/** Stable construction plan identity. */
export type ConstructionPlanId = string;

/**
 * Declarative plan reference originating from Construction Selection Result.
 * Reuses Chapter 23 SelectedReference without duplication or transformation.
 */
export type ConstructionPlanReference = SelectedReference;

/** Immutable declarative plan contents (ordered references). */
export type ConstructionPlanContents = readonly ConstructionPlanReference[];

/**
 * Declarative plan metadata.
 * Identifier / name / version / description / creation / annotations -
 * no runtime info; metadata does not affect behavior.
 */
export interface ConstructionPlanMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly description?: string;
    readonly creationMetadata?: string;
    readonly architecturalAnnotations?: string;
}

/**
 * Declarative Construction Plan structure (props / shape).
 * Identity, metadata, and contents only - no compatibility or integrity
 * runtime fields; no executable representation.
 */
export interface ConstructionPlanProps {
    readonly planId: ConstructionPlanId;
    readonly metadata: ConstructionPlanMetadata;
    readonly contents: ConstructionPlanContents;
}

/** Re-export Chapter 23 SelectedReference for consumers of this package. */
export type { SelectedReference };
