/**
 * ASA-ARCH-29.0 - Construction Planning Manifest Builder (Draft 0.3)
 *
 * Constructs immutable ConstructionPlanningManifest instances.
 * Performs structural validation only - no planning / selection /
 * discovery / resolution / scheduling logic.
 */

import type { ConstructionPlanningSpecification } from "../construction_planning_specification/ConstructionPlanningSpecification";
import { ConstructionPlanningManifest } from "./ConstructionPlanningManifest";
import type {
    ConstructionPlanningManifestContents,
    ConstructionPlanningManifestMetadata,
} from "./ConstructionPlanningManifestTypes";

/**
 * Structural builder for immutable ConstructionPlanningManifest.
 *
 * Temporary builder fields exist only during construction of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionPlanningManifestBuilder {
    private manifestId: string | undefined;
    private metadata: ConstructionPlanningManifestMetadata | undefined;
    private constructionPlanningSpecification:
        | ConstructionPlanningSpecification
        | undefined;

    withManifestId(manifestId: string): this {
        this.manifestId = manifestId;
        return this;
    }

    withMetadata(metadata: ConstructionPlanningManifestMetadata): this {
        this.metadata = metadata;
        return this;
    }

    /**
     * Supplies Construction Planning Specification by reference.
     * Does not modify, transform, or derive from the specification,
     * definition, contract, or plan.
     */
    withConstructionPlanningSpecification(
        constructionPlanningSpecification: ConstructionPlanningSpecification
    ): this {
        this.constructionPlanningSpecification =
            constructionPlanningSpecification;
        return this;
    }

    withContents(contents: ConstructionPlanningManifestContents): this {
        this.constructionPlanningSpecification =
            contents.constructionPlanningSpecification;
        return this;
    }

    /**
     * Structural validation only: required identity, metadata, and specification.
     * Does not plan, select, discover, resolve, load, or access registries.
     * Does not modify Construction Planning Specification, Definition, Contract, or Plan.
     */
    build(): ConstructionPlanningManifest {
        const manifestId = this.requireNonEmpty(
            this.manifestId,
            "manifestId"
        );
        const metadata = this.requireMetadata(this.metadata);

        if (!this.constructionPlanningSpecification) {
            throw new Error(
                "ConstructionPlanningManifest structural validation failed: constructionPlanningSpecification is required"
            );
        }

        const contents: ConstructionPlanningManifestContents = Object.freeze({
            constructionPlanningSpecification:
                this.constructionPlanningSpecification,
        });

        return new ConstructionPlanningManifest({
            manifestId,
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
                `ConstructionPlanningManifest structural validation failed: ${field} is required`
            );
        }
        return value;
    }

    private requireMetadata(
        metadata: ConstructionPlanningManifestMetadata | undefined
    ): ConstructionPlanningManifestMetadata {
        if (!metadata) {
            throw new Error(
                "ConstructionPlanningManifest structural validation failed: metadata is required"
            );
        }
        this.requireNonEmpty(metadata.identifier, "metadata.identifier");
        this.requireNonEmpty(metadata.name, "metadata.name");
        this.requireNonEmpty(metadata.version, "metadata.version");
        return Object.freeze({ ...metadata });
    }
}
