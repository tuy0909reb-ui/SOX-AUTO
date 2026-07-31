/**
 * ASA-ARCH-26.0 - Construction Planning Contract (Draft 0.4)
 *
 * Declarative type definitions only.
 *
 * ConstructionPlan is referenced from frozen Chapter 25 - not redefined here.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionPlan } from "../construction_plan/ConstructionPlan";

/** Stable construction planning contract identity. */
export type ConstructionPlanningContractId = string;

/**
 * Declarative contract metadata.
 * Identifier / name / version / description / creation / annotations -
 * no runtime info; metadata does not affect behavior.
 */
export interface ConstructionPlanningContractMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly description?: string;
    readonly creationMetadata?: string;
    readonly architecturalAnnotations?: string;
}

/**
 * Declarative contract definition.
 * References and preserves Construction Plan; declares only contractual
 * constraints (permitted consumers / relationships / usage constraints).
 */
export interface ConstructionPlanningContractDefinition {
    readonly constructionPlan: ConstructionPlan;
    readonly permittedConsumers: readonly string[];
    readonly permittedArchitecturalRelationships: readonly string[];
    readonly declarativeUsageConstraints: readonly string[];
}

/**
 * Declarative Construction Planning Contract structure (props / shape).
 * Identity, metadata, and contract definition only - no executable representation.
 */
export interface ConstructionPlanningContractProps {
    readonly contractId: ConstructionPlanningContractId;
    readonly metadata: ConstructionPlanningContractMetadata;
    readonly definition: ConstructionPlanningContractDefinition;
}

/** Re-export Chapter 25 ConstructionPlan for consumers of this package. */
export type { ConstructionPlan };
