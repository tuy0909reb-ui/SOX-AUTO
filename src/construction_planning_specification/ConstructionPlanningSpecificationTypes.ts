/**
 * ASA-ARCH-28.0 - Construction Planning Specification (Draft 0.4)
 *
 * Declarative type definitions only.
 *
 * ConstructionPlanningDefinition is referenced from frozen Chapter 27 -
 * not redefined here.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionPlanningDefinition } from "../construction_planning_definition/ConstructionPlanningDefinition";

/** Stable construction planning specification identity. */
export type ConstructionPlanningSpecificationId = string;

/**
 * Declarative specification metadata.
 * Identifier / name / version / description / creation / annotations -
 * no runtime info; metadata does not affect behavior.
 */
export interface ConstructionPlanningSpecificationMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly description?: string;
    readonly creationMetadata?: string;
    readonly architecturalAnnotations?: string;
}

/**
 * Declarative specification contents.
 * References and preserves Construction Planning Definition without
 * redefining or transforming architectural definitions.
 */
export interface ConstructionPlanningSpecificationContents {
    readonly constructionPlanningDefinition: ConstructionPlanningDefinition;
}

/**
 * Declarative Construction Planning Specification structure (props / shape).
 * Identity, metadata, and contents only - no executable representation.
 */
export interface ConstructionPlanningSpecificationProps {
    readonly specificationId: ConstructionPlanningSpecificationId;
    readonly metadata: ConstructionPlanningSpecificationMetadata;
    readonly contents: ConstructionPlanningSpecificationContents;
}

/** Re-export Chapter 27 ConstructionPlanningDefinition for consumers of this package. */
export type { ConstructionPlanningDefinition };
