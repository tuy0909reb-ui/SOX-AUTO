/**
 * ASA-ARCH-25.0 - Construction Plan model (Draft 0.3)
 *
 * Immutable declarative Construction Plan artifact.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import type { ConstructionPlanReference } from "./ConstructionPlanTypes";
import {
    ConstructionPlanId,
    ConstructionPlanMetadata,
    ConstructionPlanProps,
} from "./ConstructionPlanTypes";

/**
 * Immutable Construction Plan.
 * All fields are readonly; instances are Object.freeze'd at construction.
 */
export class ConstructionPlan implements ConstructionPlanProps {
    readonly planId: ConstructionPlanId;
    readonly metadata: ConstructionPlanMetadata;
    readonly contents: readonly ConstructionPlanReference[];

    /**
     * Package-internal constructor. Prefer ConstructionPlanBuilder.
     * Structural completeness is enforced by the builder.
     */
    constructor(init: ConstructionPlanProps) {
        this.planId = init.planId;
        this.metadata = Object.freeze({ ...init.metadata });
        this.contents = Object.freeze(
            init.contents.map((r) =>
                Object.freeze({
                    definitionReferenceId: r.definitionReferenceId,
                })
            )
        );
        Object.freeze(this);
    }
}
