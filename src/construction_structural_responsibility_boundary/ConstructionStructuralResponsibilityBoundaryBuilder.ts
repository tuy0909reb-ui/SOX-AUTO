/**
 * ASA-ARCH-31.0 - Construction Structural Responsibility Boundary Builder (Draft 0.2)
 *
 * Establishes the architectural Structural Responsibility Boundary.
 * Does NOT construct a new planning artifact or transform the Manifest.
 *
 * Performs structural responsibility classification validation only.
 * Consumes Chapter 30 Consumption Boundary exclusively — no direct Ch25–29 access.
 */

import type { ConstructionPlanningConsumptionBoundary } from "../construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary";
import { ConstructionStructuralResponsibilityBoundary } from "./ConstructionStructuralResponsibilityBoundary";
import type {
    ArchitecturalResponsibilityDomainId,
    ConstructionStructuralResponsibilityBoundaryMetadata,
    StructuralResponsibilityMapping,
} from "./ConstructionStructuralResponsibilityBoundaryTypes";

/**
 * Structural builder that establishes the Structural Responsibility Boundary.
 *
 * Temporary builder fields exist only during establishment of a single boundary.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionStructuralResponsibilityBoundaryBuilder {
    private boundaryId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private responsibilityDomainIdentifier:
        | ArchitecturalResponsibilityDomainId
        | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private consumptionBoundary:
        | ConstructionPlanningConsumptionBoundary
        | undefined;
    private mappings: StructuralResponsibilityMapping[] = [];

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

    withResponsibilityDomainIdentifier(
        responsibilityDomainIdentifier: ArchitecturalResponsibilityDomainId
    ): this {
        this.responsibilityDomainIdentifier = responsibilityDomainIdentifier;
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
     * Supplies exactly one Chapter 30 Consumption Boundary by reference.
     * Does not modify, transform, or bypass the Consumption Boundary.
     */
    withConsumptionBoundary(
        consumptionBoundary: ConstructionPlanningConsumptionBoundary
    ): this {
        this.consumptionBoundary = consumptionBoundary;
        return this;
    }

    /**
     * Supplies structural responsibility mappings (classification only).
     * Does not interpret business intent or select execution targets.
     */
    withStructuralResponsibilityMappings(
        mappings: ReadonlyArray<StructuralResponsibilityMapping>
    ): this {
        this.mappings = mappings.map((m) => ({ ...m }));
        return this;
    }

    /**
     * Establishes the Structural Responsibility Boundary after structural classification.
     *
     * Conditions (all required):
     * - exactly one Chapter 30 Consumption Boundary received
     * - Consumption Boundary immutability verified
     * - Architecturally Accepted Manifest identity preserved
     * - at least one structural responsibility mapping
     * - responsibility domain identifier present
     * - no structural incompatibility
     *
     * Does not construct another Manifest or planning artifact.
     */
    establish(): ConstructionStructuralResponsibilityBoundary {
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
        const responsibilityDomainIdentifier = this.requireNonEmpty(
            this.responsibilityDomainIdentifier,
            "responsibilityDomainIdentifier"
        );

        if (!this.consumptionBoundary) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: exactly one Consumption Boundary is required"
            );
        }

        const consumptionBoundary = this.consumptionBoundary;

        if (!Object.isFrozen(consumptionBoundary)) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: Consumption Boundary immutability verification failed"
            );
        }

        if (!Object.isFrozen(consumptionBoundary.identity)) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: Consumption Boundary identity immutability verification failed"
            );
        }

        if (!Object.isFrozen(consumptionBoundary.metadata)) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: Consumption Boundary metadata immutability verification failed"
            );
        }

        if (consumptionBoundary.metadata.validationStatus !== "accepted") {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: Consumption Boundary validation status must be accepted"
            );
        }

        const sourceBoundaryIdentifier = this.requireNonEmpty(
            consumptionBoundary.identity.boundaryId,
            "consumptionBoundary.identity.boundaryId"
        );

        const sourceManifestId = this.requireNonEmpty(
            consumptionBoundary.identity.manifestId,
            "consumptionBoundary.identity.manifestId"
        );

        const acceptedManifest =
            consumptionBoundary.architecturallyAcceptedManifest;

        if (!acceptedManifest) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: Architecturally Accepted Manifest is required"
            );
        }

        if (!Object.isFrozen(acceptedManifest)) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: Accepted Manifest immutability verification failed"
            );
        }

        if (acceptedManifest.manifestId !== sourceManifestId) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: Manifest identity preservation failed"
            );
        }

        if (this.mappings.length === 0) {
            throw new Error(
                "ConstructionStructuralResponsibilityBoundary establishment failed: at least one structural responsibility mapping is required"
            );
        }

        for (let i = 0; i < this.mappings.length; i++) {
            const mapping = this.mappings[i];
            this.requireNonEmpty(
                mapping.structuralElementId,
                `structuralResponsibilityMappings[${i}].structuralElementId`
            );
            this.requireNonEmpty(
                mapping.responsibilityDomainId,
                `structuralResponsibilityMappings[${i}].responsibilityDomainId`
            );
        }

        const metadata: ConstructionStructuralResponsibilityBoundaryMetadata =
            Object.freeze({
                architectureVersion,
                schemaVersion,
                sourceBoundaryIdentifier,
                manifestIdentifier: sourceManifestId,
                validationStatus: "established" as const,
                responsibilityDomainIdentifier,
                ...(this.creationTimestamp !== undefined
                    ? { creationTimestamp: this.creationTimestamp }
                    : {}),
                ...(this.producerIdentity !== undefined
                    ? { producerIdentity: this.producerIdentity }
                    : {}),
            });

        return new ConstructionStructuralResponsibilityBoundary({
            identity: Object.freeze({
                boundaryId,
                sourceManifestId,
                architectureVersion,
                structuralVersion,
            }),
            metadata,
            sourceConsumptionBoundary: consumptionBoundary,
            structuralResponsibilityMappings: this.mappings,
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionStructuralResponsibilityBoundary establishment failed: ${field} is required`
            );
        }
        return value;
    }
}
