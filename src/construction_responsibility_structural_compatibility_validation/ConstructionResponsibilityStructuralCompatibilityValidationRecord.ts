/**
 * ASA-ARCH-33.0 - Construction Responsibility Structural Compatibility Validation Record (Draft 0.4)
 *
 * Immutable declarative architectural validation record.
 *
 * Records deterministic structural compatibility validation after Chapter 32 definition.
 * Does NOT introduce runtime / execution / capability semantics.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import type { ConstructionResponsibilityStructuralInterfaceDefinition } from "../construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition";
import {
    ConstructionResponsibilityStructuralCompatibilityValidationIdentity,
    ConstructionResponsibilityStructuralCompatibilityValidationMetadata,
    ConstructionResponsibilityStructuralCompatibilityValidationProps,
    StructuralCompatibilityStatus,
    StructuralIncompatibilityCondition,
} from "./ConstructionResponsibilityStructuralCompatibilityValidationTypes";

/**
 * Immutable Construction Responsibility Structural Compatibility Validation Record.
 * All fields are readonly; instances are Object.freeze'd at validation.
 */
export class ConstructionResponsibilityStructuralCompatibilityValidationRecord
    implements ConstructionResponsibilityStructuralCompatibilityValidationProps
{
    readonly identity: ConstructionResponsibilityStructuralCompatibilityValidationIdentity;
    readonly metadata: ConstructionResponsibilityStructuralCompatibilityValidationMetadata;
    readonly sourceInterfaceDefinition: ConstructionResponsibilityStructuralInterfaceDefinition;
    readonly compatibilityStatus: StructuralCompatibilityStatus;
    readonly incompatibilityConditions: ReadonlyArray<StructuralIncompatibilityCondition>;

    /**
     * Package-internal constructor.
     * Prefer ConstructionResponsibilityStructuralCompatibilityValidationBuilder.validate().
     */
    constructor(
        init: ConstructionResponsibilityStructuralCompatibilityValidationProps
    ) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceInterfaceDefinition = init.sourceInterfaceDefinition;
        this.compatibilityStatus = init.compatibilityStatus;
        this.incompatibilityConditions = Object.freeze(
            init.incompatibilityConditions.map((c) => Object.freeze({ ...c }))
        );
        Object.freeze(this);
    }
}
