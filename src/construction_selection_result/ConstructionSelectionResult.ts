/**
 * ASA-ARCH-24.0 — Construction Selection Result model (Draft 1.1)
 *
 * Immutable declarative Construction Selection Result artifact.
 *
 * SHALL NOT contain selection, discovery, resolution, or runtime semantics.
 */

import type { SelectedReference } from "../construction_selection/ConstructionSelectionTypes";
import {
    ConstructionSelectionResult as ConstructionSelectionResultShape,
    ResultCompatibility,
    ResultIdentity,
    ResultIntegrity,
    ResultMetadata,
} from "./ConstructionSelectionResultTypes";

/**
 * Immutable Construction Selection Result.
 * All fields are readonly; instances are Object.freeze'd at construction.
 */
export class ConstructionSelectionResult
    implements ConstructionSelectionResultShape
{
    readonly resultId: ResultIdentity;
    readonly metadata: ResultMetadata;
    readonly contents: readonly SelectedReference[];
    readonly compatibility: ResultCompatibility;
    readonly integrity: ResultIntegrity;

    /**
     * Package-internal constructor. Prefer ConstructionSelectionResultBuilder.
     * Structural completeness is enforced by the builder.
     */
    constructor(init: ConstructionSelectionResultShape) {
        this.resultId = init.resultId;
        this.metadata = Object.freeze({ ...init.metadata });
        this.contents = Object.freeze(
            init.contents.map((r) =>
                Object.freeze({
                    definitionReferenceId: r.definitionReferenceId,
                })
            )
        );
        this.compatibility = Object.freeze({ ...init.compatibility });
        this.integrity = Object.freeze({ ...init.integrity });
        Object.freeze(this);
    }
}
