/**
 * ASA-ARCH-31.0 - Construction Structural Responsibility Boundary (Draft 0.2)
 *
 * Declarative type definitions only.
 *
 * ConstructionPlanningConsumptionBoundary is referenced from frozen Chapter 30 -
 * not redefined here.
 *
 * This chapter establishes a structural responsibility classification boundary only.
 * It does NOT introduce another declarative planning artifact.
 * It does NOT depend directly on Chapters 25–29.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionPlanningConsumptionBoundary } from "../construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary";
import type { ConstructionPlanningConsumptionBoundaryId } from "../construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryTypes";
import type { ConstructionPlanningManifestId } from "../construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryTypes";

/** Stable structural responsibility boundary identity. */
export type ConstructionStructuralResponsibilityBoundaryId = string;

/** Architectural responsibility domain identifier (structural classification only). */
export type ArchitecturalResponsibilityDomainId = string;

/**
 * Identifier of a Manifest structural element for classification mapping.
 * This is an opaque structural id — not a business interpretation.
 */
export type ManifestStructuralElementId = string;

/**
 * Structural Responsibility Mapping:
 * Manifest structural element → Architectural responsibility domain.
 *
 * Not: requirement → capability → execution target.
 */
export interface StructuralResponsibilityMapping {
    readonly structuralElementId: ManifestStructuralElementId;
    readonly responsibilityDomainId: ArchitecturalResponsibilityDomainId;
}

/**
 * Immutable boundary identity.
 * Source Manifest Identifier is preserved from the accepted Consumption Boundary —
 * Chapter 31 never redefines Manifest identity.
 */
export interface ConstructionStructuralResponsibilityBoundaryIdentity {
    readonly boundaryId: ConstructionStructuralResponsibilityBoundaryId;
    readonly sourceManifestId: ConstructionPlanningManifestId;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
}

/**
 * Structural boundary metadata only.
 * SHALL NOT contain runtime / execution / behavioral state.
 */
export interface ConstructionStructuralResponsibilityBoundaryMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly sourceBoundaryIdentifier: ConstructionPlanningConsumptionBoundaryId;
    readonly manifestIdentifier: string;
    readonly validationStatus: "established";
    readonly responsibilityDomainIdentifier: ArchitecturalResponsibilityDomainId;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Established Structural Responsibility Boundary shape.
 *
 * `sourceConsumptionBoundary` is the Chapter 30 accepted boundary by reference.
 * `structuralResponsibilityMappings` are structural classifications only —
 * not a new planning artifact and not a copy of Manifest contents.
 */
export interface ConstructionStructuralResponsibilityBoundaryProps {
    readonly identity: ConstructionStructuralResponsibilityBoundaryIdentity;
    readonly metadata: ConstructionStructuralResponsibilityBoundaryMetadata;
    readonly sourceConsumptionBoundary: ConstructionPlanningConsumptionBoundary;
    readonly structuralResponsibilityMappings: ReadonlyArray<StructuralResponsibilityMapping>;
}

/** Re-export Chapter 30 Consumption Boundary for consumers of this package. */
export type {
    ConstructionPlanningConsumptionBoundary,
    ConstructionPlanningConsumptionBoundaryId,
    ConstructionPlanningManifestId,
};
