/**
 * ASA-ARCH-27.0 - Construction Planning Definition (Draft 0.5)
 *
 * Declarative type definitions only.
 *
 * ConstructionPlanningContract is referenced from frozen Chapter 26 -
 * not redefined here.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionPlanningContract } from "../construction_planning_contract/ConstructionPlanningContract";

/** Stable construction planning definition identity. */
export type ConstructionPlanningDefinitionId = string;

/**
 * Declarative definition metadata.
 * Identifier / name / version / description / creation / annotations -
 * no runtime info; metadata does not affect behavior.
 */
export interface ConstructionPlanningDefinitionMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly description?: string;
    readonly creationMetadata?: string;
    readonly architecturalAnnotations?: string;
}

/**
 * Declarative definition contents.
 * References and preserves Construction Planning Contract without
 * redefining or transforming contractual constraints.
 */
export interface ConstructionPlanningDefinitionContents {
    readonly constructionPlanningContract: ConstructionPlanningContract;
}

/**
 * Declarative Construction Planning Definition structure (props / shape).
 * Identity, metadata, and contents only - no executable representation.
 */
export interface ConstructionPlanningDefinitionProps {
    readonly definitionId: ConstructionPlanningDefinitionId;
    readonly metadata: ConstructionPlanningDefinitionMetadata;
    readonly contents: ConstructionPlanningDefinitionContents;
}

/** Re-export Chapter 26 ConstructionPlanningContract for consumers of this package. */
export type { ConstructionPlanningContract };
