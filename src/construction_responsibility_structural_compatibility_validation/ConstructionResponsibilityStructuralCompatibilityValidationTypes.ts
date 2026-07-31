/**
 * ASA-ARCH-33.0 - Construction Responsibility Structural Compatibility Validation (Draft 0.4)
 *
 * Declarative type definitions only.
 *
 * ConstructionResponsibilityStructuralInterfaceDefinition is referenced from
 * frozen Chapter 32 — not redefined here.
 *
 * "Compatibility" means structural compatibility only —
 * not execution / runtime / implementation / performance / business compatibility.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ConstructionResponsibilityStructuralInterfaceDefinition } from "../construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition";
import type { ConstructionResponsibilityStructuralInterfaceDefinitionId } from "../construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionTypes";

/** Stable Structural Compatibility Validation identity. */
export type ConstructionResponsibilityStructuralCompatibilityValidationId =
    string;

/**
 * Deterministic structural compatibility status.
 * Not an execution / capability / readiness decision.
 */
export type StructuralCompatibilityStatus = "compatible" | "incompatible";

/**
 * Recorded structural incompatibility condition (structural references only).
 * Does not interpret business meaning or propose corrections.
 */
export interface StructuralIncompatibilityCondition {
    readonly conditionId: string;
    readonly structuralElementRef: string;
}

/**
 * Immutable validation record identity.
 * Source identities are preserved from Chapter 32 — never redefined.
 */
export interface ConstructionResponsibilityStructuralCompatibilityValidationIdentity {
    readonly validationId: ConstructionResponsibilityStructuralCompatibilityValidationId;
    readonly sourceInterfaceDefinitionId: ConstructionResponsibilityStructuralInterfaceDefinitionId;
    readonly sourceResponsibilityBoundaryId: string;
    readonly sourceManifestId: string;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
}

/**
 * Structural metadata only.
 * SHALL NOT contain runtime / execution / behavioral / readiness state.
 */
export interface ConstructionResponsibilityStructuralCompatibilityValidationMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly sourceInterfaceDefinitionIdentifier: ConstructionResponsibilityStructuralInterfaceDefinitionId;
    readonly compatibilityStatus: StructuralCompatibilityStatus;
    readonly compatibilityRuleVersion: string;
    readonly validationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Established Structural Compatibility Validation Record shape.
 *
 * `sourceInterfaceDefinition` is the Chapter 32 definition by reference.
 * The record does not replace or modify the Structural Interface Definition.
 */
export interface ConstructionResponsibilityStructuralCompatibilityValidationProps {
    readonly identity: ConstructionResponsibilityStructuralCompatibilityValidationIdentity;
    readonly metadata: ConstructionResponsibilityStructuralCompatibilityValidationMetadata;
    readonly sourceInterfaceDefinition: ConstructionResponsibilityStructuralInterfaceDefinition;
    readonly compatibilityStatus: StructuralCompatibilityStatus;
    readonly incompatibilityConditions: ReadonlyArray<StructuralIncompatibilityCondition>;
}

/** Re-export Chapter 32 definition types for consumers of this package. */
export type {
    ConstructionResponsibilityStructuralInterfaceDefinition,
    ConstructionResponsibilityStructuralInterfaceDefinitionId,
};
