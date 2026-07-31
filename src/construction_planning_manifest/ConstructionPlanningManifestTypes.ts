/**
 * ASA-ARCH-29.0 - Construction Planning Manifest (Draft 0.3)
 *
 * Declarative type definitions only.
 *
 * ConstructionPlanningSpecification is referenced from frozen Chapter 28 -
 * not redefined here.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionPlanningSpecification } from "../construction_planning_specification/ConstructionPlanningSpecification";

/** Stable construction planning manifest identity. */
export type ConstructionPlanningManifestId = string;

/**
 * Declarative manifest metadata.
 * Identifier / name / version / description / creation / annotations -
 * no runtime info; metadata does not affect behavior.
 */
export interface ConstructionPlanningManifestMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly description?: string;
    readonly creationMetadata?: string;
    readonly architecturalAnnotations?: string;
}

/**
 * Declarative manifest contents.
 * References and preserves Construction Planning Specification without
 * redefining or transforming architectural definitions.
 */
export interface ConstructionPlanningManifestContents {
    readonly constructionPlanningSpecification: ConstructionPlanningSpecification;
}

/**
 * Declarative Construction Planning Manifest structure (props / shape).
 * Identity, metadata, and contents only - no executable representation.
 */
export interface ConstructionPlanningManifestProps {
    readonly manifestId: ConstructionPlanningManifestId;
    readonly metadata: ConstructionPlanningManifestMetadata;
    readonly contents: ConstructionPlanningManifestContents;
}

/** Re-export Chapter 28 ConstructionPlanningSpecification for consumers of this package. */
export type { ConstructionPlanningSpecification };
