/**
 * ASA-ARCH-24.0 — Construction Selection Result Builder (Draft 1.1)
 *
 * Constructs immutable ConstructionSelectionResult instances.
 * Performs structural validation only — no selection / discovery / resolution logic.
 */

import type { SelectedReference } from "../construction_selection/ConstructionSelectionTypes";
import { ConstructionSelectionResult } from "./ConstructionSelectionResult";
import {
    ResultCompatibility,
    ResultMetadata,
} from "./ConstructionSelectionResultTypes";

const DEFAULT_COMPATIBILITY: ResultCompatibility = Object.freeze({
    version: "1.1",
    contract: "ASA-ARCH-24.0",
    preservesFrozenContractCompatibility: true as const,
    preservesSelectedReferenceCompatibility: true as const,
    preservesPriorResultCompatibility: true as const,
    preservesResultElementValidity: true as const,
});

/**
 * Structural builder for immutable ConstructionSelectionResult.
 *
 * Temporary builder fields exist only during construction of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionSelectionResultBuilder {
    private resultId: string | undefined;
    private metadata: ResultMetadata | undefined;
    private readonly contents: SelectedReference[] = [];
    private compatibility: ResultCompatibility = DEFAULT_COMPATIBILITY;

    withResultId(resultId: string): this {
        this.resultId = resultId;
        return this;
    }

    withMetadata(metadata: ResultMetadata): this {
        this.metadata = metadata;
        return this;
    }

    addSelectedReference(selectedReference: SelectedReference): this {
        this.contents.push(selectedReference);
        return this;
    }

    withContents(contents: readonly SelectedReference[]): this {
        this.contents.length = 0;
        for (const ref of contents) {
            this.contents.push(ref);
        }
        return this;
    }

    withCompatibility(compatibility: ResultCompatibility): this {
        this.compatibility = compatibility;
        return this;
    }

    /**
     * Structural validation only: required identity, metadata, and non-empty contents.
     * Does not select, discover, resolve, load, or validate against registries.
     */
    build(): ConstructionSelectionResult {
        const resultId = this.requireNonEmpty(this.resultId, "resultId");
        const metadata = this.requireMetadata(this.metadata);

        if (this.contents.length === 0) {
            throw new Error(
                "ConstructionSelectionResult structural validation failed: contents must be non-empty"
            );
        }

        for (let i = 0; i < this.contents.length; i++) {
            this.requireNonEmpty(
                this.contents[i]?.definitionReferenceId,
                `contents[${i}].definitionReferenceId`
            );
        }

        const contents: readonly SelectedReference[] = this.contents.map((r) =>
            Object.freeze({
                definitionReferenceId: r.definitionReferenceId,
            })
        );

        return new ConstructionSelectionResult({
            resultId,
            metadata,
            contents,
            compatibility: Object.freeze({ ...this.compatibility }),
            integrity: Object.freeze({
                requiresValidResultIdentity: true as const,
                requiresValidResultMetadata: true as const,
                requiresValidResultContents: true as const,
                requiresValidSelectedReferences: true as const,
                requiresResultConsistency: true as const,
            }),
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionSelectionResult structural validation failed: ${field} is required`
            );
        }
        return value;
    }

    private requireMetadata(
        metadata: ResultMetadata | undefined
    ): ResultMetadata {
        if (!metadata) {
            throw new Error(
                "ConstructionSelectionResult structural validation failed: metadata is required"
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
