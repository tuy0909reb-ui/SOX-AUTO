/**
 * ASA-ARCH-30.0 - Construction Planning Consumption Boundary Builder (Draft 0.3)
 *
 * Establishes the architectural Consumption Boundary.
 * Does NOT construct a new planning artifact or transform the Manifest.
 *
 * Performs structural acceptance validation only.
 */

import type { ConstructionPlanningManifest } from "../construction_planning_manifest/ConstructionPlanningManifest";
import { ConstructionPlanningConsumptionBoundary } from "./ConstructionPlanningConsumptionBoundary";
import type {
    ConstructionPlanningConsumptionBoundaryMetadata,
} from "./ConstructionPlanningConsumptionBoundaryTypes";

/**
 * Structural builder that establishes the Consumption Boundary.
 *
 * Temporary builder fields exist only during establishment of a single boundary.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionPlanningConsumptionBoundaryBuilder {
    private boundaryId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private manifest: ConstructionPlanningManifest | undefined;

    withBoundaryId(boundaryId: string): this {
        this.boundaryId = boundaryId;
        return this;
    }

    withArchitectureVersion(architectureVersion: string): this {
        this.architectureVersion = architectureVersion;
        return this;
    }

    withStructuralVersion(structuralVersion: string): this {
        this.structuralVersion = structuralVersion;
        return this;
    }

    withSchemaVersion(schemaVersion: string): this {
        this.schemaVersion = schemaVersion;
        return this;
    }

    withCreationTimestamp(creationTimestamp: string): this {
        this.creationTimestamp = creationTimestamp;
        return this;
    }

    withProducerIdentity(producerIdentity: string): this {
        this.producerIdentity = producerIdentity;
        return this;
    }

    /**
     * Supplies exactly one Construction Planning Manifest by reference.
     * Does not modify, transform, duplicate, or replace the Manifest.
     */
    withManifest(manifest: ConstructionPlanningManifest): this {
        this.manifest = manifest;
        return this;
    }

    /**
     * Establishes the Consumption Boundary after structural acceptance.
     *
     * Conditions (all required):
     * - exactly one Manifest received
     * - Manifest structural validation succeeded
     * - Manifest identity preserved
     * - Manifest immutability verified
     * - no structural incompatibility
     * - architectural acceptance completed
     *
     * Does not construct another Manifest or planning artifact.
     */
    establish(): ConstructionPlanningConsumptionBoundary {
        const boundaryId = this.requireNonEmpty(
            this.boundaryId,
            "boundaryId"
        );
        const architectureVersion = this.requireNonEmpty(
            this.architectureVersion,
            "architectureVersion"
        );
        const structuralVersion = this.requireNonEmpty(
            this.structuralVersion,
            "structuralVersion"
        );
        const schemaVersion = this.requireNonEmpty(
            this.schemaVersion,
            "schemaVersion"
        );

        if (!this.manifest) {
            throw new Error(
                "ConstructionPlanningConsumptionBoundary establishment failed: exactly one Manifest is required"
            );
        }

        const manifest = this.manifest;

        if (!Object.isFrozen(manifest)) {
            throw new Error(
                "ConstructionPlanningConsumptionBoundary establishment failed: Manifest immutability verification failed"
            );
        }

        const manifestId = this.requireNonEmpty(
            manifest.manifestId,
            "manifest.manifestId"
        );

        if (!manifest.metadata) {
            throw new Error(
                "ConstructionPlanningConsumptionBoundary establishment failed: Manifest structural validation failed (metadata)"
            );
        }

        if (!manifest.contents?.constructionPlanningSpecification) {
            throw new Error(
                "ConstructionPlanningConsumptionBoundary establishment failed: Manifest structural validation failed (contents)"
            );
        }

        if (!Object.isFrozen(manifest.metadata)) {
            throw new Error(
                "ConstructionPlanningConsumptionBoundary establishment failed: Manifest metadata immutability verification failed"
            );
        }

        if (!Object.isFrozen(manifest.contents)) {
            throw new Error(
                "ConstructionPlanningConsumptionBoundary establishment failed: Manifest contents immutability verification failed"
            );
        }

        const metadata: ConstructionPlanningConsumptionBoundaryMetadata =
            Object.freeze({
                architectureVersion,
                schemaVersion,
                manifestIdentifier: manifestId,
                validationStatus: "accepted" as const,
                ...(this.creationTimestamp !== undefined
                    ? { creationTimestamp: this.creationTimestamp }
                    : {}),
                ...(this.producerIdentity !== undefined
                    ? { producerIdentity: this.producerIdentity }
                    : {}),
            });

        return new ConstructionPlanningConsumptionBoundary({
            identity: Object.freeze({
                boundaryId,
                manifestId,
                architectureVersion,
                structuralVersion,
            }),
            metadata,
            architecturallyAcceptedManifest: manifest,
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionPlanningConsumptionBoundary establishment failed: ${field} is required`
            );
        }
        return value;
    }
}
