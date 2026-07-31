/**
 * ASA-ARCH-34.0 - Construction Responsibility Structural Normalization Builder (Draft 0.4)
 *
 * Establishes deterministic structural representation normalization of a
 * Chapter 33 compatible Structural Compatibility Validation Record.
 * Does NOT create runtime / execution / capability contracts.
 *
 * Performs structural representation normalization only.
 * Consumes Chapter 33 Validation Record exclusively —
 * no direct Ch25–32 access.
 */

import type { ConstructionResponsibilityStructuralCompatibilityValidationRecord } from "../construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationRecord";
import { ConstructionResponsibilityStructuralNormalizationRecord } from "./ConstructionResponsibilityStructuralNormalizationRecord";
import type {
    ConstructionResponsibilityStructuralNormalizationMetadata,
    NormalizedStructuralRepresentation,
} from "./ConstructionResponsibilityStructuralNormalizationTypes";

/**
 * Structural builder that produces an immutable Structural Normalization Record.
 *
 * Temporary builder fields exist only during normalization of a single record.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionResponsibilityStructuralNormalizationBuilder {
    private normalizationId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private normalizationRuleVersion: string | undefined;
    private normalizationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceValidationRecord:
        | ConstructionResponsibilityStructuralCompatibilityValidationRecord
        | undefined;

    withNormalizationId(normalizationId: string): this {
        this.normalizationId = normalizationId;
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

    withNormalizationRuleVersion(normalizationRuleVersion: string): this {
        this.normalizationRuleVersion = normalizationRuleVersion;
        return this;
    }

    withNormalizationTimestamp(normalizationTimestamp: string): this {
        this.normalizationTimestamp = normalizationTimestamp;
        return this;
    }

    withProducerIdentity(producerIdentity: string): this {
        this.producerIdentity = producerIdentity;
        return this;
    }

    /**
     * Supplies exactly one Chapter 33 Validation Record by reference.
     * Does not modify, transform, or bypass the source validation record.
     */
    withSourceValidationRecord(
        sourceValidationRecord: ConstructionResponsibilityStructuralCompatibilityValidationRecord
    ): this {
        this.sourceValidationRecord = sourceValidationRecord;
        return this;
    }

    /**
     * Establishes the immutable Structural Normalization Record.
     *
     * Accepts only compatible validation records.
     * Rejects incompatible validation records.
     * Preserves source identities and structural equivalence.
     *
     * Does not create runtime / execution / capability contracts.
     */
    normalize(): ConstructionResponsibilityStructuralNormalizationRecord {
        const normalizationId = this.requireNonEmpty(
            this.normalizationId,
            "normalizationId"
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
        const normalizationRuleVersion = this.requireNonEmpty(
            this.normalizationRuleVersion,
            "normalizationRuleVersion"
        );

        if (!this.sourceValidationRecord) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: exactly one source Validation Record is required"
            );
        }

        const source = this.sourceValidationRecord;

        if (!Object.isFrozen(source)) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: source Validation Record immutability verification failed"
            );
        }

        if (!Object.isFrozen(source.identity)) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: source Validation Record identity immutability verification failed"
            );
        }

        if (!Object.isFrozen(source.metadata)) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: source Validation Record metadata immutability verification failed"
            );
        }

        if (source.compatibilityStatus !== "compatible") {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: only compatible Validation Records are accepted"
            );
        }

        if (source.metadata.compatibilityStatus !== "compatible") {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: only compatible Validation Records are accepted"
            );
        }

        if (
            source.incompatibilityConditions &&
            source.incompatibilityConditions.length > 0
        ) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: incompatible Validation Records shall not proceed to structural normalization"
            );
        }

        const sourceValidationId = this.requireNonEmpty(
            source.identity.validationId,
            "sourceValidationRecord.identity.validationId"
        );
        const sourceInterfaceDefinitionId = this.requireNonEmpty(
            source.identity.sourceInterfaceDefinitionId,
            "sourceValidationRecord.identity.sourceInterfaceDefinitionId"
        );
        const sourceResponsibilityBoundaryId = this.requireNonEmpty(
            source.identity.sourceResponsibilityBoundaryId,
            "sourceValidationRecord.identity.sourceResponsibilityBoundaryId"
        );
        const sourceManifestId = this.requireNonEmpty(
            source.identity.sourceManifestId,
            "sourceValidationRecord.identity.sourceManifestId"
        );

        const interfaceDefinition = source.sourceInterfaceDefinition;
        if (!interfaceDefinition) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: source Interface Definition is required"
            );
        }

        if (!Object.isFrozen(interfaceDefinition)) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: source Interface Definition immutability verification failed"
            );
        }

        this.requireNonEmpty(
            interfaceDefinition.responsibilityDomainStructure
                ?.responsibilityDomainId,
            "sourceInterfaceDefinition.responsibilityDomainStructure.responsibilityDomainId"
        );
        this.requireNonEmpty(
            interfaceDefinition.responsibilityDomainStructure?.domainStructureId,
            "sourceInterfaceDefinition.responsibilityDomainStructure.domainStructureId"
        );
        this.requireNonEmpty(
            interfaceDefinition.inputStructureDefinition?.structureId,
            "sourceInterfaceDefinition.inputStructureDefinition.structureId"
        );
        this.requireNonEmpty(
            interfaceDefinition.outputStructureDefinition?.structureId,
            "sourceInterfaceDefinition.outputStructureDefinition.structureId"
        );

        if (
            !interfaceDefinition.compatibilityConstraints ||
            interfaceDefinition.compatibilityConstraints.length === 0
        ) {
            throw new Error(
                "ConstructionResponsibilityStructuralNormalization normalization failed: compatibility constraints are required"
            );
        }

        // Deterministic representation ordering only — no structural element
        // introduction, removal, inference, or reinterpretation.
        const orderedConstraints = [
            ...interfaceDefinition.compatibilityConstraints,
        ].sort((a, b) => a.constraintId.localeCompare(b.constraintId));

        const normalizedStructuralRepresentation: NormalizedStructuralRepresentation =
            Object.freeze({
                sourceValidationId,
                sourceInterfaceDefinitionId,
                sourceResponsibilityBoundaryId,
                sourceManifestId,
                responsibilityDomainId:
                    interfaceDefinition.responsibilityDomainStructure
                        .responsibilityDomainId,
                domainStructureId:
                    interfaceDefinition.responsibilityDomainStructure
                        .domainStructureId,
                inputStructureId:
                    interfaceDefinition.inputStructureDefinition.structureId,
                outputStructureId:
                    interfaceDefinition.outputStructureDefinition.structureId,
                compatibilityConstraintIds: Object.freeze(
                    orderedConstraints.map((c) => c.constraintId)
                ),
                requiredInputStructureIds: Object.freeze(
                    orderedConstraints.map((c) => c.requiredInputStructureId)
                ),
                requiredOutputStructureIds: Object.freeze(
                    orderedConstraints.map((c) => c.requiredOutputStructureId)
                ),
            });

        const metadata: ConstructionResponsibilityStructuralNormalizationMetadata =
            Object.freeze({
                architectureVersion,
                schemaVersion,
                sourceValidationIdentifier: sourceValidationId,
                normalizationStatus: "normalized" as const,
                normalizationRuleVersion,
                ...(this.normalizationTimestamp !== undefined
                    ? { normalizationTimestamp: this.normalizationTimestamp }
                    : {}),
                ...(this.producerIdentity !== undefined
                    ? { producerIdentity: this.producerIdentity }
                    : {}),
            });

        return new ConstructionResponsibilityStructuralNormalizationRecord({
            identity: Object.freeze({
                normalizationId,
                sourceValidationId,
                sourceInterfaceDefinitionId,
                sourceResponsibilityBoundaryId,
                architectureVersion,
                structuralVersion,
            }),
            metadata,
            sourceValidationRecord: source,
            normalizedStructuralRepresentation,
        });
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionResponsibilityStructuralNormalization normalization failed: ${field} is required`
            );
        }
        return value;
    }
}
