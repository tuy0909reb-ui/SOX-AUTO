/**
 * ASA-ARCH-32.0 - Construction Responsibility Structural Interface Definition Builder (Draft 0.3)
 *
 * Defines the immutable Structural Interface Definition.
 * Does NOT create runtime / execution / capability contracts.
 *
 * Performs structural validation only.
 * Consumes Chapter 31 Structural Responsibility Boundary exclusively —
 * no direct Ch25–30 access.
 */

import type { ConstructionStructuralResponsibilityBoundary } from "../construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary";
import { ConstructionResponsibilityStructuralInterfaceDefinition } from "./ConstructionResponsibilityStructuralInterfaceDefinition";
import type {
    ConstructionResponsibilityStructuralInterfaceDefinitionMetadata,
    ResponsibilityDomainStructure,
    StructuralCompatibilityConstraint,
    StructuralInterfaceInputDefinition,
    StructuralInterfaceOutputDefinition,
} from "./ConstructionResponsibilityStructuralInterfaceDefinitionTypes";

/**
 * Structural builder that defines the Structural Interface Definition.
 *
 * Temporary builder fields exist only during definition of a single instance.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionResponsibilityStructuralInterfaceDefinitionBuilder {
    private interfaceDefinitionId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceResponsibilityBoundary:
        | ConstructionStructuralResponsibilityBoundary
        | undefined;
    private responsibilityDomainStructure:
        | ResponsibilityDomainStructure
        | undefined;
    private inputStructureDefinition:
        | StructuralInterfaceInputDefinition
        | undefined;
    private outputStructureDefinition:
        | StructuralInterfaceOutputDefinition
        | undefined;
    private compatibilityConstraints: StructuralCompatibilityConstraint[] = [];

    withInterfaceDefinitionId(interfaceDefinitionId: string): this {
        this.interfaceDefinitionId = interfaceDefinitionId;
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
     * Supplies exactly one Chapter 31 Structural Responsibility Boundary by reference.
     * Does not modify, transform, or bypass the source boundary.
     */
    withSourceResponsibilityBoundary(
        sourceResponsibilityBoundary: ConstructionStructuralResponsibilityBoundary
    ): this {
        this.sourceResponsibilityBoundary = sourceResponsibilityBoundary;
        return this;
    }

    withResponsibilityDomainStructure(
        responsibilityDomainStructure: ResponsibilityDomainStructure
    ): this {
        this.responsibilityDomainStructure = {
            ...responsibilityDomainStructure,
        };
        return this;
    }

    withInputStructureDefinition(
        inputStructureDefinition: StructuralInterfaceInputDefinition
    ): this {
        this.inputStructureDefinition = { ...inputStructureDefinition };
        return this;
    }

    withOutputStructureDefinition(
        outputStructureDefinition: StructuralInterfaceOutputDefinition
    ): this {
        this.outputStructureDefinition = { ...outputStructureDefinition };
        return this;
    }

    withCompatibilityConstraints(
        compatibilityConstraints: ReadonlyArray<StructuralCompatibilityConstraint>
    ): this {
        this.compatibilityConstraints = compatibilityConstraints.map((c) => ({
            ...c,
        }));
        return this;
    }

    /**
     * Defines the immutable Structural Interface Definition after structural validation.
     *
     * Conditions (all required):
     * - exactly one Chapter 31 boundary received
     * - source boundary identity / Manifest identity present
     * - structural version present
     * - responsibility domain structure present and compatible
     * - input / output structure definitions present
     * - at least one valid compatibility constraint
     *
     * Does not create runtime / execution / capability contracts.
     */
    define(): ConstructionResponsibilityStructuralInterfaceDefinition {
        const interfaceDefinitionId = this.requireNonEmpty(
            this.interfaceDefinitionId,
            "interfaceDefinitionId"
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

        if (!this.sourceResponsibilityBoundary) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: exactly one source Responsibility Boundary is required"
            );
        }

        const sourceBoundary = this.sourceResponsibilityBoundary;

        if (!Object.isFrozen(sourceBoundary)) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: source Responsibility Boundary immutability verification failed"
            );
        }

        if (!Object.isFrozen(sourceBoundary.identity)) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: source Responsibility Boundary identity immutability verification failed"
            );
        }

        if (!Object.isFrozen(sourceBoundary.metadata)) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: source Responsibility Boundary metadata immutability verification failed"
            );
        }

        if (sourceBoundary.metadata.validationStatus !== "established") {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: source Responsibility Boundary validation status must be established"
            );
        }

        const sourceResponsibilityBoundaryId = this.requireNonEmpty(
            sourceBoundary.identity.boundaryId,
            "sourceResponsibilityBoundary.identity.boundaryId"
        );

        const sourceManifestId = this.requireNonEmpty(
            sourceBoundary.identity.sourceManifestId,
            "sourceResponsibilityBoundary.identity.sourceManifestId"
        );

        if (!this.responsibilityDomainStructure) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: responsibility domain structure is required"
            );
        }

        const responsibilityDomainStructure = this.responsibilityDomainStructure;
        this.requireNonEmpty(
            responsibilityDomainStructure.responsibilityDomainId,
            "responsibilityDomainStructure.responsibilityDomainId"
        );
        this.requireNonEmpty(
            responsibilityDomainStructure.domainStructureId,
            "responsibilityDomainStructure.domainStructureId"
        );

        if (
            responsibilityDomainStructure.responsibilityDomainId !==
            sourceBoundary.metadata.responsibilityDomainIdentifier
        ) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: responsibility domain structure is incompatible with source Responsibility Boundary"
            );
        }

        if (!this.inputStructureDefinition) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: input structure definition is required"
            );
        }
        this.requireNonEmpty(
            this.inputStructureDefinition.structureId,
            "inputStructureDefinition.structureId"
        );

        if (!this.outputStructureDefinition) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: output structure definition is required"
            );
        }
        this.requireNonEmpty(
            this.outputStructureDefinition.structureId,
            "outputStructureDefinition.structureId"
        );

        if (this.compatibilityConstraints.length === 0) {
            throw new Error(
                "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: at least one compatibility constraint is required"
            );
        }

        for (let i = 0; i < this.compatibilityConstraints.length; i++) {
            const constraint = this.compatibilityConstraints[i];
            this.requireNonEmpty(
                constraint.constraintId,
                `compatibilityConstraints[${i}].constraintId`
            );
            this.requireNonEmpty(
                constraint.requiredInputStructureId,
                `compatibilityConstraints[${i}].requiredInputStructureId`
            );
            this.requireNonEmpty(
                constraint.requiredOutputStructureId,
                `compatibilityConstraints[${i}].requiredOutputStructureId`
            );

            if (
                constraint.requiredInputStructureId !==
                this.inputStructureDefinition.structureId
            ) {
                throw new Error(
                    "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: invalid compatibility constraints (input structure mismatch)"
                );
            }
            if (
                constraint.requiredOutputStructureId !==
                this.outputStructureDefinition.structureId
            ) {
                throw new Error(
                    "ConstructionResponsibilityStructuralInterfaceDefinition definition failed: invalid compatibility constraints (output structure mismatch)"
                );
            }
        }

        const metadata: ConstructionResponsibilityStructuralInterfaceDefinitionMetadata =
            Object.freeze({
                architectureVersion,
                schemaVersion,
                sourceResponsibilityBoundaryIdentifier:
                    sourceResponsibilityBoundaryId,
                responsibilityDomainIdentifier:
                    responsibilityDomainStructure.responsibilityDomainId,
                validationStatus: "defined" as const,
                ...(this.creationTimestamp !== undefined
                    ? { creationTimestamp: this.creationTimestamp }
                    : {}),
                ...(this.producerIdentity !== undefined
                    ? { producerIdentity: this.producerIdentity }
                    : {}),
            });

        return new ConstructionResponsibilityStructuralInterfaceDefinition({
            identity: Object.freeze({
                interfaceDefinitionId,
                sourceResponsibilityBoundaryId,
                sourceManifestId,
                architectureVersion,
                structuralVersion,
            }),
            metadata,
            sourceResponsibilityBoundary: sourceBoundary,
            responsibilityDomainStructure,
            inputStructureDefinition: this.inputStructureDefinition,
            outputStructureDefinition: this.outputStructureDefinition,
            compatibilityConstraints: this.compatibilityConstraints,
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionResponsibilityStructuralInterfaceDefinition definition failed: ${field} is required`
            );
        }
        return value;
    }
}
