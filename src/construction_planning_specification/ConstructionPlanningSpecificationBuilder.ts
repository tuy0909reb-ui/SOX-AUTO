/**
 * ASA-ARCH-28.0 - Construction Planning Specification Builder (Draft 0.4)
 *
 * Constructs immutable ConstructionPlanningSpecification instances.
 * Performs structural validation only - no planning / selection /
 * discovery / resolution / scheduling logic.
 */

import type { ConstructionPlanningDefinition } from "../construction_planning_definition/ConstructionPlanningDefinition";
import { ConstructionPlanningSpecification } from "./ConstructionPlanningSpecification";
import type {
    ConstructionPlanningSpecificationContents,
    ConstructionPlanningSpecificationMetadata,
} from "./ConstructionPlanningSpecificationTypes";

/**
 * Structural builder for immutable ConstructionPlanningSpecification.
 *
 * Temporary builder fields exist only during construction of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionPlanningSpecificationBuilder {
    private specificationId: string | undefined;
    private metadata: ConstructionPlanningSpecificationMetadata | undefined;
    private constructionPlanningDefinition:
        | ConstructionPlanningDefinition
        | undefined;

    withSpecificationId(specificationId: string): this {
        this.specificationId = specificationId;
        return this;
    }

    withMetadata(metadata: ConstructionPlanningSpecificationMetadata): this {
        this.metadata = metadata;
        return this;
    }

    /**
     * Supplies Construction Planning Definition by reference.
     * Does not modify, transform, or derive from the definition,
     * contract, or plan.
     */
    withConstructionPlanningDefinition(
        constructionPlanningDefinition: ConstructionPlanningDefinition
    ): this {
        this.constructionPlanningDefinition = constructionPlanningDefinition;
        return this;
    }

    withContents(contents: ConstructionPlanningSpecificationContents): this {
        this.constructionPlanningDefinition =
            contents.constructionPlanningDefinition;
        return this;
    }

    /**
     * Structural validation only: required identity, metadata, and definition.
     * Does not plan, select, discover, resolve, load, or access registries.
     * Does not modify Construction Planning Definition, Contract, or Plan.
     */
    build(): ConstructionPlanningSpecification {
        const specificationId = this.requireNonEmpty(
            this.specificationId,
            "specificationId"
        );
        const metadata = this.requireMetadata(this.metadata);

        if (!this.constructionPlanningDefinition) {
            throw new Error(
                "ConstructionPlanningSpecification structural validation failed: constructionPlanningDefinition is required"
            );
        }

        const contents: ConstructionPlanningSpecificationContents =
            Object.freeze({
                constructionPlanningDefinition:
                    this.constructionPlanningDefinition,
            });

        return new ConstructionPlanningSpecification({
            specificationId,
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
                `ConstructionPlanningSpecification structural validation failed: ${field} is required`
            );
        }
        return value;
    }

    private requireMetadata(
        metadata: ConstructionPlanningSpecificationMetadata | undefined
    ): ConstructionPlanningSpecificationMetadata {
        if (!metadata) {
            throw new Error(
                "ConstructionPlanningSpecification structural validation failed: metadata is required"
            );
        }
        this.requireNonEmpty(metadata.identifier, "metadata.identifier");
        this.requireNonEmpty(metadata.name, "metadata.name");
        this.requireNonEmpty(metadata.version, "metadata.version");
        return Object.freeze({ ...metadata });
    }
}
