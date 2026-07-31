/**
 * ASA-ARCH-32.0 - Construction Responsibility Structural Interface Definition model (Draft 0.3)
 *
 * Immutable declarative architectural definition.
 *
 * Defines structural interface requirements after Chapter 31 classification.
 * Does NOT introduce runtime / execution / capability semantics.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import type { ConstructionStructuralResponsibilityBoundary } from "../construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary";
import {
    ConstructionResponsibilityStructuralInterfaceDefinitionIdentity,
    ConstructionResponsibilityStructuralInterfaceDefinitionMetadata,
    ConstructionResponsibilityStructuralInterfaceDefinitionProps,
    ResponsibilityDomainStructure,
    StructuralCompatibilityConstraint,
    StructuralInterfaceInputDefinition,
    StructuralInterfaceOutputDefinition,
} from "./ConstructionResponsibilityStructuralInterfaceDefinitionTypes";

/**
 * Immutable Construction Responsibility Structural Interface Definition.
 * All fields are readonly; instances are Object.freeze'd at definition.
 */
export class ConstructionResponsibilityStructuralInterfaceDefinition
    implements ConstructionResponsibilityStructuralInterfaceDefinitionProps
{
    readonly identity: ConstructionResponsibilityStructuralInterfaceDefinitionIdentity;
    readonly metadata: ConstructionResponsibilityStructuralInterfaceDefinitionMetadata;
    readonly sourceResponsibilityBoundary: ConstructionStructuralResponsibilityBoundary;
    readonly responsibilityDomainStructure: ResponsibilityDomainStructure;
    readonly inputStructureDefinition: StructuralInterfaceInputDefinition;
    readonly outputStructureDefinition: StructuralInterfaceOutputDefinition;
    readonly compatibilityConstraints: ReadonlyArray<StructuralCompatibilityConstraint>;

    /**
     * Package-internal constructor.
     * Prefer ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.define().
     */
    constructor(
        init: ConstructionResponsibilityStructuralInterfaceDefinitionProps
    ) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceResponsibilityBoundary = init.sourceResponsibilityBoundary;
        this.responsibilityDomainStructure = Object.freeze({
            ...init.responsibilityDomainStructure,
        });
        this.inputStructureDefinition = Object.freeze({
            ...init.inputStructureDefinition,
        });
        this.outputStructureDefinition = Object.freeze({
            ...init.outputStructureDefinition,
        });
        this.compatibilityConstraints = Object.freeze(
            init.compatibilityConstraints.map((c) => Object.freeze({ ...c }))
        );
        Object.freeze(this);
    }
}
