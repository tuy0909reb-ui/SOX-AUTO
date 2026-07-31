/**
 * ASA-ARCH-23.0 — Construction Selection Builder (Draft 1.4)
 *
 * Constructs immutable ConstructionSelection instances.
 * Performs structural validation only — no selection / discovery / resolution logic.
 */

import { ConstructionSelection } from "./ConstructionSelection";
import {
    SelectedReference,
    SelectionCompatibility,
    SelectionMetadata,
} from "./ConstructionSelectionTypes";

const DEFAULT_COMPATIBILITY: SelectionCompatibility = Object.freeze({
    version: "1.4",
    contract: "ASA-ARCH-23.0",
    preservesFrozenContractCompatibility: true as const,
    preservesDiscoveryResultCompatibility: true as const,
    preservesPriorSelectionCompatibility: true as const,
    preservesSelectedReferenceValidity: true as const,
});

/**
 * Structural builder for immutable ConstructionSelection.
 *
 * Temporary builder fields exist only during construction of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionSelectionBuilder {
    private selectionId: string | undefined;
    private discoveryResultId: string | undefined;
    private readonly selectedReferenceIds: string[] = [];
    private metadata: SelectionMetadata | undefined;
    private compatibility: SelectionCompatibility = DEFAULT_COMPATIBILITY;

    withSelectionId(selectionId: string): this {
        this.selectionId = selectionId;
        return this;
    }

    withDiscoveryResultReference(discoveryResultId: string): this {
        this.discoveryResultId = discoveryResultId;
        return this;
    }

    addSelectedReference(definitionReferenceId: string): this {
        this.selectedReferenceIds.push(definitionReferenceId);
        return this;
    }

    withMetadata(metadata: SelectionMetadata): this {
        this.metadata = metadata;
        return this;
    }

    withCompatibility(compatibility: SelectionCompatibility): this {
        this.compatibility = compatibility;
        return this;
    }

    /**
     * Structural validation only: required non-empty identity fields and metadata shape.
     * Does not select, discover, resolve, load, or validate against registries.
     */
    build(): ConstructionSelection {
        const selectionId = this.requireNonEmpty(
            this.selectionId,
            "selectionId"
        );
        const discoveryResultId = this.requireNonEmpty(
            this.discoveryResultId,
            "discoveryResultReference.discoveryResultId"
        );
        const metadata = this.requireMetadata(this.metadata);

        for (let i = 0; i < this.selectedReferenceIds.length; i++) {
            this.requireNonEmpty(
                this.selectedReferenceIds[i],
                `selectedReferences[${i}].definitionReferenceId`
            );
        }

        const selectedReferences: readonly SelectedReference[] =
            this.selectedReferenceIds.map((definitionReferenceId) =>
                Object.freeze({ definitionReferenceId })
            );

        return new ConstructionSelection({
            selectionId,
            discoveryResultReference: Object.freeze({ discoveryResultId }),
            selectedReferences,
            metadata,
            compatibility: Object.freeze({ ...this.compatibility }),
            integrity: Object.freeze({
                requiresValidSelectionIdentity: true as const,
                requiresValidSelectedReferences: true as const,
                requiresSelectionConsistency: true as const,
            }),
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionSelection structural validation failed: ${field} is required`
            );
        }
        return value;
    }

    private requireMetadata(
        metadata: SelectionMetadata | undefined
    ): SelectionMetadata {
        if (!metadata) {
            throw new Error(
                "ConstructionSelection structural validation failed: metadata is required"
            );
        }
        this.requireNonEmpty(metadata.identifier, "metadata.identifier");
        this.requireNonEmpty(metadata.name, "metadata.name");
        this.requireNonEmpty(metadata.version, "metadata.version");
        this.requireNonEmpty(metadata.ownership, "metadata.ownership");
        this.requireNonEmpty(
            metadata.compatibilityInformation,
            "metadata.compatibilityInformation"
        );
        return Object.freeze({ ...metadata });
    }
}
