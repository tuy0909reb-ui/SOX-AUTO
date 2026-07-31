/**
 * ASA-ARCH-32.0 - Construction Responsibility Structural Interface Definition (Draft 0.3)
 *
 * Declarative type definitions only.
 *
 * ConstructionStructuralResponsibilityBoundary is referenced from frozen Chapter 31 -
 * not redefined here.
 *
 * "Interface" means structural architectural relationships only —
 * not runtime / executable / service / implementation interfaces.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionStructuralResponsibilityBoundary } from "../construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary";
import type {
    ArchitecturalResponsibilityDomainId,
    ConstructionStructuralResponsibilityBoundaryId,
} from "../construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryTypes";

/** Stable Structural Interface Definition identity. */
export type ConstructionResponsibilityStructuralInterfaceDefinitionId = string;

/** Opaque structural structure identifier. */
export type StructuralStructureId = string;

/** Opaque compatibility constraint identifier. */
export type StructuralCompatibilityConstraintId = string;

/**
 * Responsibility domain structure (classification domain + structural shape id).
 * Structural only — not capability or implementation selection.
 */
export interface ResponsibilityDomainStructure {
    readonly responsibilityDomainId: ArchitecturalResponsibilityDomainId;
    readonly domainStructureId: StructuralStructureId;
}

/**
 * Accepted structural input definition for a responsibility domain.
 */
export interface StructuralInterfaceInputDefinition {
    readonly structureId: StructuralStructureId;
}

/**
 * Produced structural output definition for a responsibility domain.
 */
export interface StructuralInterfaceOutputDefinition {
    readonly structureId: StructuralStructureId;
}

/**
 * Structural compatibility constraint linking required input/output structures.
 * Not an execution or capability constraint.
 */
export interface StructuralCompatibilityConstraint {
    readonly constraintId: StructuralCompatibilityConstraintId;
    readonly requiredInputStructureId: StructuralStructureId;
    readonly requiredOutputStructureId: StructuralStructureId;
}

/**
 * Immutable Structural Interface Definition identity.
 * Source identities are preserved from Chapter 31 — never redefined.
 */
export interface ConstructionResponsibilityStructuralInterfaceDefinitionIdentity {
    readonly interfaceDefinitionId: ConstructionResponsibilityStructuralInterfaceDefinitionId;
    readonly sourceResponsibilityBoundaryId: ConstructionStructuralResponsibilityBoundaryId;
    readonly sourceManifestId: string;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
}

/**
 * Structural metadata only.
 * SHALL NOT contain runtime / execution / behavioral / readiness state.
 */
export interface ConstructionResponsibilityStructuralInterfaceDefinitionMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly sourceResponsibilityBoundaryIdentifier: ConstructionStructuralResponsibilityBoundaryId;
    readonly responsibilityDomainIdentifier: ArchitecturalResponsibilityDomainId;
    readonly validationStatus: "defined";
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Established Structural Interface Definition shape.
 *
 * `sourceResponsibilityBoundary` is the Chapter 31 boundary by reference.
 * Structural definitions expose connection requirements only.
 */
export interface ConstructionResponsibilityStructuralInterfaceDefinitionProps {
    readonly identity: ConstructionResponsibilityStructuralInterfaceDefinitionIdentity;
    readonly metadata: ConstructionResponsibilityStructuralInterfaceDefinitionMetadata;
    readonly sourceResponsibilityBoundary: ConstructionStructuralResponsibilityBoundary;
    readonly responsibilityDomainStructure: ResponsibilityDomainStructure;
    readonly inputStructureDefinition: StructuralInterfaceInputDefinition;
    readonly outputStructureDefinition: StructuralInterfaceOutputDefinition;
    readonly compatibilityConstraints: ReadonlyArray<StructuralCompatibilityConstraint>;
}

/** Re-export Chapter 31 boundary types for consumers of this package. */
export type {
    ArchitecturalResponsibilityDomainId,
    ConstructionStructuralResponsibilityBoundary,
    ConstructionStructuralResponsibilityBoundaryId,
};
