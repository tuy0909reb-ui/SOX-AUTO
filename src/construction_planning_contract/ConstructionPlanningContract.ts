/**
 * ASA-ARCH-26.0 - Construction Planning Contract model (Draft 0.4)
 *
 * Immutable declarative Construction Planning Contract artifact.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import {
    ConstructionPlanningContractDefinition,
    ConstructionPlanningContractId,
    ConstructionPlanningContractMetadata,
    ConstructionPlanningContractProps,
} from "./ConstructionPlanningContractTypes";

/**
 * Immutable Construction Planning Contract.
 * All fields are readonly; instances are Object.freeze'd at construction.
 */
export class ConstructionPlanningContract
    implements ConstructionPlanningContractProps
{
    readonly contractId: ConstructionPlanningContractId;
    readonly metadata: ConstructionPlanningContractMetadata;
    readonly definition: ConstructionPlanningContractDefinition;

    /**
     * Package-internal constructor. Prefer ConstructionPlanningContractBuilder.
     * Structural completeness is enforced by the builder.
     */
    constructor(init: ConstructionPlanningContractProps) {
        this.contractId = init.contractId;
        this.metadata = Object.freeze({ ...init.metadata });
        this.definition = Object.freeze({
            constructionPlan: init.definition.constructionPlan,
            permittedConsumers: Object.freeze([
                ...init.definition.permittedConsumers,
            ]),
            permittedArchitecturalRelationships: Object.freeze([
                ...init.definition.permittedArchitecturalRelationships,
            ]),
            declarativeUsageConstraints: Object.freeze([
                ...init.definition.declarativeUsageConstraints,
            ]),
        });
        Object.freeze(this);
    }
}
