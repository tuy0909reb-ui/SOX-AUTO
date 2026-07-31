/**
 * ASA-ARCH-33.0 - Construction Responsibility Structural Compatibility Validation Builder (Draft 0.4)
 *
 * Validates structural compatibility of a Chapter 32 Structural Interface Definition.
 * Does NOT create runtime / execution / capability contracts.
 *
 * Performs structural validation only.
 * Consumes Chapter 32 Structural Interface Definition exclusively —
 * no direct Ch25–31 access.
 */

import type { ConstructionResponsibilityStructuralInterfaceDefinition } from "../construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition";
import { ConstructionResponsibilityStructuralCompatibilityValidationRecord } from "./ConstructionResponsibilityStructuralCompatibilityValidationRecord";
import type {
    ConstructionResponsibilityStructuralCompatibilityValidationMetadata,
    StructuralCompatibilityStatus,
    StructuralIncompatibilityCondition,
} from "./ConstructionResponsibilityStructuralCompatibilityValidationTypes";

/**
 * Structural builder that produces an immutable Structural Compatibility Validation Record.
 *
 * Temporary builder fields exist only during validation of a single record.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ConstructionResponsibilityStructuralCompatibilityValidationBuilder {
    private validationId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private compatibilityRuleVersion: string | undefined;
    private validationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceInterfaceDefinition:
        | ConstructionResponsibilityStructuralInterfaceDefinition
        | undefined;

    withValidationId(validationId: string): this {
        this.validationId = validationId;
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

    withCompatibilityRuleVersion(compatibilityRuleVersion: string): this {
        this.compatibilityRuleVersion = compatibilityRuleVersion;
        return this;
    }

    withValidationTimestamp(validationTimestamp: string): this {
        this.validationTimestamp = validationTimestamp;
        return this;
    }

    withProducerIdentity(producerIdentity: string): this {
        this.producerIdentity = producerIdentity;
        return this;
    }

    /**
     * Supplies exactly one Chapter 32 Structural Interface Definition by reference.
     * Does not modify, transform, or bypass the source definition.
     */
    withSourceInterfaceDefinition(
        sourceInterfaceDefinition: ConstructionResponsibilityStructuralInterfaceDefinition
    ): this {
        this.sourceInterfaceDefinition = sourceInterfaceDefinition;
        return this;
    }

    /**
     * Validates structural compatibility and produces an immutable Validation Record.
     *
     * Missing required builder inputs / missing source definition → throw.
     * Structural incompatibilities → recorded as status `incompatible` (no upstream mutation).
     *
     * Does not create runtime / execution / capability contracts.
     */
    validate(): ConstructionResponsibilityStructuralCompatibilityValidationRecord {
        const validationId = this.requireNonEmpty(
            this.validationId,
            "validationId"
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
        const compatibilityRuleVersion = this.requireNonEmpty(
            this.compatibilityRuleVersion,
            "compatibilityRuleVersion"
        );

        if (!this.sourceInterfaceDefinition) {
            throw new Error(
                "ConstructionResponsibilityStructuralCompatibilityValidation validation failed: exactly one source Interface Definition is required"
            );
        }

        const source = this.sourceInterfaceDefinition;

        if (!Object.isFrozen(source)) {
            throw new Error(
                "ConstructionResponsibilityStructuralCompatibilityValidation validation failed: source Interface Definition immutability verification failed"
            );
        }

        if (!Object.isFrozen(source.identity)) {
            throw new Error(
                "ConstructionResponsibilityStructuralCompatibilityValidation validation failed: source Interface Definition identity immutability verification failed"
            );
        }

        if (!Object.isFrozen(source.metadata)) {
            throw new Error(
                "ConstructionResponsibilityStructuralCompatibilityValidation validation failed: source Interface Definition metadata immutability verification failed"
            );
        }

        const sourceInterfaceDefinitionId = this.requireNonEmpty(
            source.identity.interfaceDefinitionId,
            "sourceInterfaceDefinition.identity.interfaceDefinitionId"
        );
        const sourceResponsibilityBoundaryId = this.requireNonEmpty(
            source.identity.sourceResponsibilityBoundaryId,
            "sourceInterfaceDefinition.identity.sourceResponsibilityBoundaryId"
        );
        const sourceManifestId = this.requireNonEmpty(
            source.identity.sourceManifestId,
            "sourceInterfaceDefinition.identity.sourceManifestId"
        );

        const conditions: StructuralIncompatibilityCondition[] = [];

        if (source.metadata.validationStatus !== "defined") {
            conditions.push({
                conditionId: "metadata.validationStatus",
                structuralElementRef: "metadata.validationStatus",
            });
        }

        if (
            source.metadata.sourceResponsibilityBoundaryIdentifier !==
            sourceResponsibilityBoundaryId
        ) {
            conditions.push({
                conditionId: "identity.boundaryConsistency",
                structuralElementRef:
                    "identity.sourceResponsibilityBoundaryId",
            });
        }

        if (!source.responsibilityDomainStructure) {
            conditions.push({
                conditionId: "responsibilityDomainStructure.missing",
                structuralElementRef: "responsibilityDomainStructure",
            });
        } else {
            if (
                !source.responsibilityDomainStructure.responsibilityDomainId ||
                source.responsibilityDomainStructure.responsibilityDomainId.trim()
                    .length === 0
            ) {
                conditions.push({
                    conditionId:
                        "responsibilityDomainStructure.responsibilityDomainId",
                    structuralElementRef:
                        "responsibilityDomainStructure.responsibilityDomainId",
                });
            }
            if (
                !source.responsibilityDomainStructure.domainStructureId ||
                source.responsibilityDomainStructure.domainStructureId.trim()
                    .length === 0
            ) {
                conditions.push({
                    conditionId:
                        "responsibilityDomainStructure.domainStructureId",
                    structuralElementRef:
                        "responsibilityDomainStructure.domainStructureId",
                });
            }
            if (
                source.responsibilityDomainStructure.responsibilityDomainId !==
                source.metadata.responsibilityDomainIdentifier
            ) {
                conditions.push({
                    conditionId: "responsibilityDomainStructure.consistency",
                    structuralElementRef:
                        "responsibilityDomainStructure.responsibilityDomainId",
                });
            }
        }

        if (
            !source.inputStructureDefinition?.structureId ||
            source.inputStructureDefinition.structureId.trim().length === 0
        ) {
            conditions.push({
                conditionId: "inputStructureDefinition.structureId",
                structuralElementRef: "inputStructureDefinition.structureId",
            });
        }

        if (
            !source.outputStructureDefinition?.structureId ||
            source.outputStructureDefinition.structureId.trim().length === 0
        ) {
            conditions.push({
                conditionId: "outputStructureDefinition.structureId",
                structuralElementRef: "outputStructureDefinition.structureId",
            });
        }

        if (
            !source.compatibilityConstraints ||
            source.compatibilityConstraints.length === 0
        ) {
            conditions.push({
                conditionId: "compatibilityConstraints.missing",
                structuralElementRef: "compatibilityConstraints",
            });
        } else {
            for (let i = 0; i < source.compatibilityConstraints.length; i++) {
                const constraint = source.compatibilityConstraints[i];
                if (
                    !constraint.constraintId ||
                    constraint.constraintId.trim().length === 0
                ) {
                    conditions.push({
                        conditionId: `compatibilityConstraints[${i}].constraintId`,
                        structuralElementRef: `compatibilityConstraints[${i}].constraintId`,
                    });
                }
                if (
                    constraint.requiredInputStructureId !==
                    source.inputStructureDefinition?.structureId
                ) {
                    conditions.push({
                        conditionId: `compatibilityConstraints[${i}].requiredInputStructureId`,
                        structuralElementRef: `compatibilityConstraints[${i}].requiredInputStructureId`,
                    });
                }
                if (
                    constraint.requiredOutputStructureId !==
                    source.outputStructureDefinition?.structureId
                ) {
                    conditions.push({
                        conditionId: `compatibilityConstraints[${i}].requiredOutputStructureId`,
                        structuralElementRef: `compatibilityConstraints[${i}].requiredOutputStructureId`,
                    });
                }
            }
        }

        const compatibilityStatus: StructuralCompatibilityStatus =
            conditions.length === 0 ? "compatible" : "incompatible";

        const metadata: ConstructionResponsibilityStructuralCompatibilityValidationMetadata =
            Object.freeze({
                architectureVersion,
                schemaVersion,
                sourceInterfaceDefinitionIdentifier: sourceInterfaceDefinitionId,
                compatibilityStatus,
                compatibilityRuleVersion,
                ...(this.validationTimestamp !== undefined
                    ? { validationTimestamp: this.validationTimestamp }
                    : {}),
                ...(this.producerIdentity !== undefined
                    ? { producerIdentity: this.producerIdentity }
                    : {}),
            });

        return new ConstructionResponsibilityStructuralCompatibilityValidationRecord(
            {
                identity: Object.freeze({
                    validationId,
                    sourceInterfaceDefinitionId,
                    sourceResponsibilityBoundaryId,
                    sourceManifestId,
                    architectureVersion,
                    structuralVersion,
                }),
                metadata,
                sourceInterfaceDefinition: source,
                compatibilityStatus,
                incompatibilityConditions: conditions,
            }
        );
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ConstructionResponsibilityStructuralCompatibilityValidation validation failed: ${field} is required`
            );
        }
        return value;
    }
}
