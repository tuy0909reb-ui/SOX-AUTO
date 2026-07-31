/**
 * ASA-ARCH-23.0 — Construction Selection model (Draft 1.4)
 *
 * Immutable declarative Construction Selection artifact.
 *
 * SHALL NOT contain selection algorithms, runtime semantics, or executable behavior.
 */

import {
    ConstructionSelection as ConstructionSelectionShape,
    DeclarativeDiscoveryResultReference,
    SelectedReference,
    SelectionCompatibility,
    SelectionIdentity,
    SelectionIntegrity,
    SelectionMetadata,
} from "./ConstructionSelectionTypes";

/**
 * Immutable Construction Selection.
 * All fields are readonly; instances are Object.freeze'd at construction.
 */
export class ConstructionSelection implements ConstructionSelectionShape {
    readonly selectionId: SelectionIdentity;
    readonly discoveryResultReference: DeclarativeDiscoveryResultReference;
    readonly selectedReferences: readonly SelectedReference[];
    readonly metadata: SelectionMetadata;
    readonly compatibility: SelectionCompatibility;
    readonly integrity: SelectionIntegrity;

    /**
     * Package-internal constructor. Prefer ConstructionSelectionBuilder.
     * Structural completeness is enforced by the builder.
     */
    constructor(init: ConstructionSelectionShape) {
        this.selectionId = init.selectionId;
        this.discoveryResultReference = Object.freeze({
            discoveryResultId:
                init.discoveryResultReference.discoveryResultId,
        });
        this.selectedReferences = Object.freeze(
            init.selectedReferences.map((r) =>
                Object.freeze({
                    definitionReferenceId: r.definitionReferenceId,
                })
            )
        );
        this.metadata = Object.freeze({ ...init.metadata });
        this.compatibility = Object.freeze({ ...init.compatibility });
        this.integrity = Object.freeze({ ...init.integrity });
        Object.freeze(this);
    }
}
