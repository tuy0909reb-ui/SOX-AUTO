/**
 * ASA-ARCH-28.0 - Construction Planning Specification model (Draft 0.4)
 *
 * Immutable declarative Construction Planning Specification artifact.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import {
    ConstructionPlanningSpecificationContents,
    ConstructionPlanningSpecificationId,
    ConstructionPlanningSpecificationMetadata,
    ConstructionPlanningSpecificationProps,
} from "./ConstructionPlanningSpecificationTypes";

/**
 * Immutable Construction Planning Specification.
 * All fields are readonly; instances are Object.freeze'd at construction.
 */
export class ConstructionPlanningSpecification
    implements ConstructionPlanningSpecificationProps
{
    readonly specificationId: ConstructionPlanningSpecificationId;
    readonly metadata: ConstructionPlanningSpecificationMetadata;
    readonly contents: ConstructionPlanningSpecificationContents;

    /**
     * Package-internal constructor. Prefer ConstructionPlanningSpecificationBuilder.
     * Structural completeness is enforced by the builder.
     */
    constructor(init: ConstructionPlanningSpecificationProps) {
        this.specificationId = init.specificationId;
        this.metadata = Object.freeze({ ...init.metadata });
        this.contents = Object.freeze({
            constructionPlanningDefinition:
                init.contents.constructionPlanningDefinition,
        });
        Object.freeze(this);
    }
}
