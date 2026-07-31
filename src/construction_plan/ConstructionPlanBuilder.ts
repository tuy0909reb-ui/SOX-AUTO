/**
 * ASA-ARCH-25.0 - Construction Plan Builder (Draft 0.3)
 *
 * Constructs immutable ConstructionPlan instances.
 * Performs structural validation only - no planning / selection /
 * discovery / resolution / scheduling logic.
 */

import { ConstructionPlan } from "./ConstructionPlan";
import type {
    ConstructionPlanMetadata,
    ConstructionPlanReference,
} from "./ConstructionPlanTypes";

/**
 * Structural builder for immutable ConstructionPlan.
 *
 * Temporary builder fields exist only during construction of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionPlanBuilder {
    private planId: string | undefined;
    private metadata: ConstructionPlanMetadata | undefined;
    private readonly contents: ConstructionPlanReference[] = [];

    withPlanId(planId: string): this {
        this.planId = planId;
        return this;
    }

    withMetadata(metadata: ConstructionPlanMetadata): this {
        this.metadata = metadata;
        return this;
    }

    addReference(reference: ConstructionPlanReference): this {
        this.contents.push(reference);
        return this;
    }

    /**
     * Sets contents in caller-supplied order.
     * Does not reorder, derive, or transform references.
     */
    withContents(contents: readonly ConstructionPlanReference[]): this {
        this.contents.length = 0;
        for (const ref of contents) {
            this.contents.push(ref);
        }
        return this;
    }

    /**
     * Structural validation only: required identity, metadata, and non-empty contents.
     * Does not plan, select, discover, resolve, load, reorder, or access registries.
     */
    build(): ConstructionPlan {
        const planId = this.requireNonEmpty(this.planId, "planId");
        const metadata = this.requireMetadata(this.metadata);

        if (this.contents.length === 0) {
            throw new Error(
                "ConstructionPlan structural validation failed: contents must be non-empty"
            );
        }

        for (let i = 0; i < this.contents.length; i++) {
            this.requireNonEmpty(
                this.contents[i]?.definitionReferenceId,
                `contents[${i}].definitionReferenceId`
            );
        }

        const contents: readonly ConstructionPlanReference[] =
            this.contents.map((r) =>
                Object.freeze({
                    definitionReferenceId: r.definitionReferenceId,
                })
            );

        return new ConstructionPlan({
            planId,
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
                `ConstructionPlan structural validation failed: ${field} is required`
            );
        }
        return value;
    }

    private requireMetadata(
        metadata: ConstructionPlanMetadata | undefined
    ): ConstructionPlanMetadata {
        if (!metadata) {
            throw new Error(
                "ConstructionPlan structural validation failed: metadata is required"
            );
        }
        this.requireNonEmpty(metadata.identifier, "metadata.identifier");
        this.requireNonEmpty(metadata.name, "metadata.name");
        this.requireNonEmpty(metadata.version, "metadata.version");
        return Object.freeze({ ...metadata });
    }
}
