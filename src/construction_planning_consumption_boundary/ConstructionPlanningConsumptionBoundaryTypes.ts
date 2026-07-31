/**
 * ASA-ARCH-30.0 - Construction Planning Consumption Boundary (Draft 0.3)
 *
 * Declarative type definitions only.
 *
 * ConstructionPlanningManifest is referenced from frozen Chapter 29 -
 * not redefined here.
 *
 * This chapter establishes an architectural boundary only.
 * It does NOT introduce another declarative planning artifact.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionPlanningManifest } from "../construction_planning_manifest/ConstructionPlanningManifest";
import type { ConstructionPlanningManifestId } from "../construction_planning_manifest/ConstructionPlanningManifestTypes";

/** Stable consumption boundary identity. */
export type ConstructionPlanningConsumptionBoundaryId = string;

/**
 * Immutable boundary identity.
 * Manifest Identifier is preserved from the accepted Manifest —
 * Chapter 30 never redefines Manifest identity.
 */
export interface ConstructionPlanningConsumptionBoundaryIdentity {
    readonly boundaryId: ConstructionPlanningConsumptionBoundaryId;
    readonly manifestId: ConstructionPlanningManifestId;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
}

/**
 * Structural boundary metadata only.
 * SHALL NOT contain runtime / execution / behavioral state.
 */
export interface ConstructionPlanningConsumptionBoundaryMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly manifestIdentifier: string;
    readonly validationStatus: "accepted";
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Established Consumption Boundary shape.
 *
 * `architecturallyAcceptedManifest` is the original immutable Manifest
 * after structural acceptance — not a new architectural artifact.
 */
export interface ConstructionPlanningConsumptionBoundaryProps {
    readonly identity: ConstructionPlanningConsumptionBoundaryIdentity;
    readonly metadata: ConstructionPlanningConsumptionBoundaryMetadata;
    readonly architecturallyAcceptedManifest: ConstructionPlanningManifest;
}

/** Re-export Chapter 29 ConstructionPlanningManifest for consumers of this package. */
export type { ConstructionPlanningManifest, ConstructionPlanningManifestId };
