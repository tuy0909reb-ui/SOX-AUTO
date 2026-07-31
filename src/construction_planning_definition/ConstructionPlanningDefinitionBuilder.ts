/**
 * ASA-ARCH-27.0 - Construction Planning Definition Builder (Draft 0.5)
 *
 * Constructs immutable ConstructionPlanningDefinition instances.
 * Performs structural validation only - no planning / selection /
 * discovery / resolution / scheduling logic.
 */

import type { ConstructionPlanningContract } from "../construction_planning_contract/ConstructionPlanningContract";
import { ConstructionPlanningDefinition } from "./ConstructionPlanningDefinition";
import type {
    ConstructionPlanningDefinitionContents,
    ConstructionPlanningDefinitionMetadata,
} from "./ConstructionPlanningDefinitionTypes";

/**
 * Structural builder for immutable ConstructionPlanningDefinition.
 *
 * Temporary builder fields exist only during construction of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionPlanningDefinitionBuilder {
    private definitionId: string | undefined;
    private metadata: ConstructionPlanningDefinitionMetadata | undefined;
    private constructionPlanningContract:
        | ConstructionPlanningContract
        | undefined;

    withDefinitionId(definitionId: string): this {
        this.definitionId = definitionId;
        return this;
    }

    withMetadata(metadata: ConstructionPlanningDefinitionMetadata): this {
        this.metadata = metadata;
        return this;
    }

    /**
     * Supplies Construction Planning Contract by reference.
     * Does not modify, transform, or derive from the contract or its plan.
     */
    withConstructionPlanningContract(
        constructionPlanningContract: ConstructionPlanningContract
    ): this {
        this.constructionPlanningContract = constructionPlanningContract;
        return this;
    }

    withContents(contents: ConstructionPlanningDefinitionContents): this {
        this.constructionPlanningContract =
            contents.constructionPlanningContract;
        return this;
    }

    /**
     * Structural validation only: required identity, metadata, and contract.
     * Does not plan, select, discover, resolve, load, or access registries.
     * Does not modify Construction Planning Contract or Construction Plan.
     */
    build(): ConstructionPlanningDefinition {
        const definitionId = this.requireNonEmpty(
            this.definitionId,
            "definitionId"
        );
        const metadata = this.requireMetadata(this.metadata);

        if (!this.constructionPlanningContract) {
            throw new Error(
                "ConstructionPlanningDefinition structural validation failed: constructionPlanningContract is required"
            );
        }

        const contents: ConstructionPlanningDefinitionContents =
            Object.freeze({
                constructionPlanningContract:
                    this.constructionPlanningContract,
            });

        return new ConstructionPlanningDefinition({
            definitionId,
            metadata,
            contents,
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionPlanningDefinition structural validation failed: ${field} is required`
            );
        }
        return value;
    }

    private requireMetadata(
        metadata: ConstructionPlanningDefinitionMetadata | undefined
    ): ConstructionPlanningDefinitionMetadata {
        if (!metadata) {
            throw new Error(
                "ConstructionPlanningDefinition structural validation failed: metadata is required"
            );
        }
        this.requireNonEmpty(metadata.identifier, "metadata.identifier");
        this.requireNonEmpty(metadata.name, "metadata.name");
        this.requireNonEmpty(metadata.version, "metadata.version");
        return Object.freeze({ ...metadata });
    }
}
