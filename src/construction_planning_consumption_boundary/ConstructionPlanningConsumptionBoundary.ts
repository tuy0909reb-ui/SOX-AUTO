/**
 * ASA-ARCH-30.0 - Construction Planning Consumption Boundary model (Draft 0.3)
 *
 * Immutable declarative architectural boundary.
 *
 * Establishes formal acceptance of an immutable Construction Planning Manifest.
 * Does NOT introduce another declarative planning artifact.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import type { ConstructionPlanningManifest } from "../construction_planning_manifest/ConstructionPlanningManifest";
import {
    ConstructionPlanningConsumptionBoundaryIdentity,
    ConstructionPlanningConsumptionBoundaryMetadata,
    ConstructionPlanningConsumptionBoundaryProps,
} from "./ConstructionPlanningConsumptionBoundaryTypes";

/**
 * Immutable Construction Planning Consumption Boundary.
 * All fields are readonly; instances are Object.freeze'd at establishment.
 */
export class ConstructionPlanningConsumptionBoundary
    implements ConstructionPlanningConsumptionBoundaryProps
{
    readonly identity: ConstructionPlanningConsumptionBoundaryIdentity;
    readonly metadata: ConstructionPlanningConsumptionBoundaryMetadata;
    readonly architecturallyAcceptedManifest: ConstructionPlanningManifest;

    /**
     * Package-internal constructor.
     * Prefer ConstructionPlanningConsumptionBoundaryBuilder.establish().
     */
    constructor(init: ConstructionPlanningConsumptionBoundaryProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.architecturallyAcceptedManifest =
            init.architecturallyAcceptedManifest;
        Object.freeze(this);
    }
}
