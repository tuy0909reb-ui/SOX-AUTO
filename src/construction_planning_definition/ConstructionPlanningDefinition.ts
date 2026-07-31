/**
 * ASA-ARCH-27.0 - Construction Planning Definition model (Draft 0.5)
 *
 * Immutable declarative Construction Planning Definition artifact.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import {
    ConstructionPlanningDefinitionContents,
    ConstructionPlanningDefinitionId,
    ConstructionPlanningDefinitionMetadata,
    ConstructionPlanningDefinitionProps,
} from "./ConstructionPlanningDefinitionTypes";

/**
 * Immutable Construction Planning Definition.
 * All fields are readonly; instances are Object.freeze'd at construction.
 */
export class ConstructionPlanningDefinition
    implements ConstructionPlanningDefinitionProps
{
    readonly definitionId: ConstructionPlanningDefinitionId;
    readonly metadata: ConstructionPlanningDefinitionMetadata;
    readonly contents: ConstructionPlanningDefinitionContents;

    /**
     * Package-internal constructor. Prefer ConstructionPlanningDefinitionBuilder.
     * Structural completeness is enforced by the builder.
     */
    constructor(init: ConstructionPlanningDefinitionProps) {
        this.definitionId = init.definitionId;
        this.metadata = Object.freeze({ ...init.metadata });
        this.contents = Object.freeze({
            constructionPlanningContract:
                init.contents.constructionPlanningContract,
        });
        Object.freeze(this);
    }
}
