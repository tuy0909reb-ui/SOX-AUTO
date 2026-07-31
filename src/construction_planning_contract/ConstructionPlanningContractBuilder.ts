/**
 * ASA-ARCH-26.0 - Construction Planning Contract Builder (Draft 0.4)
 *
 * Constructs immutable ConstructionPlanningContract instances.
 * Performs structural validation only - no planning / selection /
 * discovery / resolution / scheduling logic.
 */

import type { ConstructionPlan } from "../construction_plan/ConstructionPlan";
import { ConstructionPlanningContract } from "./ConstructionPlanningContract";
import type {
    ConstructionPlanningContractDefinition,
    ConstructionPlanningContractMetadata,
} from "./ConstructionPlanningContractTypes";

/**
 * Structural builder for immutable ConstructionPlanningContract.
 *
 * Temporary builder fields exist only during construction of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionPlanningContractBuilder {
    private contractId: string | undefined;
    private metadata: ConstructionPlanningContractMetadata | undefined;
    private constructionPlan: ConstructionPlan | undefined;
    private permittedConsumers: readonly string[] = Object.freeze([]);
    private permittedArchitecturalRelationships: readonly string[] =
        Object.freeze([]);
    private declarativeUsageConstraints: readonly string[] = Object.freeze([]);

    withContractId(contractId: string): this {
        this.contractId = contractId;
        return this;
    }

    withMetadata(metadata: ConstructionPlanningContractMetadata): this {
        this.metadata = metadata;
        return this;
    }

    /**
     * Supplies Construction Plan by reference.
     * Does not modify, transform, or derive from the plan.
     */
    withConstructionPlan(constructionPlan: ConstructionPlan): this {
        this.constructionPlan = constructionPlan;
        return this;
    }

    withPermittedConsumers(consumers: readonly string[]): this {
        this.permittedConsumers = consumers;
        return this;
    }

    withPermittedArchitecturalRelationships(
        relationships: readonly string[]
    ): this {
        this.permittedArchitecturalRelationships = relationships;
        return this;
    }

    withDeclarativeUsageConstraints(constraints: readonly string[]): this {
        this.declarativeUsageConstraints = constraints;
        return this;
    }

    withDefinition(definition: ConstructionPlanningContractDefinition): this {
        this.constructionPlan = definition.constructionPlan;
        this.permittedConsumers = definition.permittedConsumers;
        this.permittedArchitecturalRelationships =
            definition.permittedArchitecturalRelationships;
        this.declarativeUsageConstraints =
            definition.declarativeUsageConstraints;
        return this;
    }

    /**
     * Structural validation only: required identity, metadata, and Construction Plan.
     * Does not plan, select, discover, resolve, load, or access registries.
     * Does not modify Construction Plan.
     */
    build(): ConstructionPlanningContract {
        const contractId = this.requireNonEmpty(
            this.contractId,
            "contractId"
        );
        const metadata = this.requireMetadata(this.metadata);

        if (!this.constructionPlan) {
            throw new Error(
                "ConstructionPlanningContract structural validation failed: constructionPlan is required"
            );
        }

        const definition: ConstructionPlanningContractDefinition =
            Object.freeze({
                constructionPlan: this.constructionPlan,
                permittedConsumers: Object.freeze([
                    ...this.permittedConsumers,
                ]),
                permittedArchitecturalRelationships: Object.freeze([
                    ...this.permittedArchitecturalRelationships,
                ]),
                declarativeUsageConstraints: Object.freeze([
                    ...this.declarativeUsageConstraints,
                ]),
            });

        return new ConstructionPlanningContract({
            contractId,
            metadata,
            definition,
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionPlanningContract structural validation failed: ${field} is required`
            );
        }
        return value;
    }

    private requireMetadata(
        metadata: ConstructionPlanningContractMetadata | undefined
    ): ConstructionPlanningContractMetadata {
        if (!metadata) {
            throw new Error(
                "ConstructionPlanningContract structural validation failed: metadata is required"
            );
        }
        this.requireNonEmpty(metadata.identifier, "metadata.identifier");
        this.requireNonEmpty(metadata.name, "metadata.name");
        this.requireNonEmpty(metadata.version, "metadata.version");
        return Object.freeze({ ...metadata });
    }
}
