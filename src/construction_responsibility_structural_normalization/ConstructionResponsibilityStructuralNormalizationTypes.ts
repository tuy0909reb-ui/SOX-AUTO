/**
 * ASA-ARCH-34.0 - Construction Responsibility Structural Normalization (Draft 0.4)
 *
 * Declarative type definitions only.
 *
 * ConstructionResponsibilityStructuralCompatibilityValidationRecord is referenced
 * from frozen Chapter 33 — not redefined here.
 *
 * "Normalization" means structural representation normalization only —
 * not semantic / business / execution / runtime / implementation / behavioral
 * normalization. Structural meaning is not altered.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionResponsibilityStructuralCompatibilityValidationRecord } from "../construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationRecord";
import type { ConstructionResponsibilityStructuralCompatibilityValidationId } from "../construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationTypes";

/** Stable Structural Normalization identity. */
export type ConstructionResponsibilityStructuralNormalizationId = string;

/**
 * Deterministic structural normalization status.
 * Not an execution / capability / readiness decision.
 */
export type StructuralNormalizationStatus = "normalized";

/**
 * Deterministic normalized structural representation.
 *
 * Preserves structural equivalence with the source validated relationship.
 * Does not introduce, remove, infer, or reinterpret structural elements.
 * Ordering of multi-value fields is deterministic for representation consistency.
 */
export interface NormalizedStructuralRepresentation {
    readonly sourceValidationId: ConstructionResponsibilityStructuralCompatibilityValidationId;
    readonly sourceInterfaceDefinitionId: string;
    readonly sourceResponsibilityBoundaryId: string;
    readonly sourceManifestId: string;
    readonly responsibilityDomainId: string;
    readonly domainStructureId: string;
    readonly inputStructureId: string;
    readonly outputStructureId: string;
    readonly compatibilityConstraintIds: ReadonlyArray<string>;
    readonly requiredInputStructureIds: ReadonlyArray<string>;
    readonly requiredOutputStructureIds: ReadonlyArray<string>;
}

/**
 * Immutable normalization record identity.
 * Source identities are preserved from Chapter 33 — never redefined.
 */
export interface ConstructionResponsibilityStructuralNormalizationIdentity {
    readonly normalizationId: ConstructionResponsibilityStructuralNormalizationId;
    readonly sourceValidationId: ConstructionResponsibilityStructuralCompatibilityValidationId;
    readonly sourceInterfaceDefinitionId: string;
    readonly sourceResponsibilityBoundaryId: string;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
}

/**
 * Structural metadata only.
 * SHALL NOT contain runtime / execution / behavioral / readiness state.
 */
export interface ConstructionResponsibilityStructuralNormalizationMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly sourceValidationIdentifier: ConstructionResponsibilityStructuralCompatibilityValidationId;
    readonly normalizationStatus: StructuralNormalizationStatus;
    readonly normalizationRuleVersion: string;
    readonly normalizationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Established Structural Normalization Record shape.
 *
 * `sourceValidationRecord` is the Chapter 33 compatible validation record by reference.
 * The record does not replace or modify upstream artifacts.
 */
export interface ConstructionResponsibilityStructuralNormalizationProps {
    readonly identity: ConstructionResponsibilityStructuralNormalizationIdentity;
    readonly metadata: ConstructionResponsibilityStructuralNormalizationMetadata;
    readonly sourceValidationRecord: ConstructionResponsibilityStructuralCompatibilityValidationRecord;
    readonly normalizedStructuralRepresentation: NormalizedStructuralRepresentation;
}

/** Re-export Chapter 33 validation types for consumers of this package. */
export type {
    ConstructionResponsibilityStructuralCompatibilityValidationId,
    ConstructionResponsibilityStructuralCompatibilityValidationRecord,
};
