/**
 * ASA-ARCH-31.0 - Construction Structural Responsibility Boundary model (Draft 0.2)
 *
 * Immutable declarative architectural boundary.
 *
 * Establishes structural responsibility classification after Chapter 30 acceptance.
 * Does NOT introduce another declarative planning artifact.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import type { ConstructionPlanningConsumptionBoundary } from "../construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary";
import {
    ConstructionStructuralResponsibilityBoundaryIdentity,
    ConstructionStructuralResponsibilityBoundaryMetadata,
    ConstructionStructuralResponsibilityBoundaryProps,
    StructuralResponsibilityMapping,
} from "./ConstructionStructuralResponsibilityBoundaryTypes";

/**
 * Immutable Construction Structural Responsibility Boundary.
 * All fields are readonly; instances are Object.freeze'd at establishment.
 */
export class ConstructionStructuralResponsibilityBoundary
    implements ConstructionStructuralResponsibilityBoundaryProps
{
    readonly identity: ConstructionStructuralResponsibilityBoundaryIdentity;
    readonly metadata: ConstructionStructuralResponsibilityBoundaryMetadata;
    readonly sourceConsumptionBoundary: ConstructionPlanningConsumptionBoundary;
    readonly structuralResponsibilityMappings: ReadonlyArray<StructuralResponsibilityMapping>;

    /**
     * Package-internal constructor.
     * Prefer ConstructionStructuralResponsibilityBoundaryBuilder.establish().
     */
    constructor(init: ConstructionStructuralResponsibilityBoundaryProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceConsumptionBoundary = init.sourceConsumptionBoundary;
        this.structuralResponsibilityMappings = Object.freeze(
            init.structuralResponsibilityMappings.map((m) =>
                Object.freeze({ ...m })
            )
        );
        Object.freeze(this);
    }
}
