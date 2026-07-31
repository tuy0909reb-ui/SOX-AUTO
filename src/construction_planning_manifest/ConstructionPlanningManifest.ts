/**
 * ASA-ARCH-29.0 - Construction Planning Manifest model (Draft 0.3)
 *
 * Immutable declarative Construction Planning Manifest artifact.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import {
    ConstructionPlanningManifestContents,
    ConstructionPlanningManifestId,
    ConstructionPlanningManifestMetadata,
    ConstructionPlanningManifestProps,
} from "./ConstructionPlanningManifestTypes";

/**
 * Immutable Construction Planning Manifest.
 * All fields are readonly; instances are Object.freeze'd at construction.
 */
export class ConstructionPlanningManifest
    implements ConstructionPlanningManifestProps
{
    readonly manifestId: ConstructionPlanningManifestId;
    readonly metadata: ConstructionPlanningManifestMetadata;
    readonly contents: ConstructionPlanningManifestContents;

    /**
     * Package-internal constructor. Prefer ConstructionPlanningManifestBuilder.
     * Structural completeness is enforced by the builder.
     */
    constructor(init: ConstructionPlanningManifestProps) {
        this.manifestId = init.manifestId;
        this.metadata = Object.freeze({ ...init.metadata });
        this.contents = Object.freeze({
            constructionPlanningSpecification:
                init.contents.constructionPlanningSpecification,
        });
        Object.freeze(this);
    }
}
