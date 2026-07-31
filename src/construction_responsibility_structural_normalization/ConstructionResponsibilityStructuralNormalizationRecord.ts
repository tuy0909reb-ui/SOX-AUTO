/**
 * ASA-ARCH-34.0 - Construction Responsibility Structural Normalization Record (Draft 0.4)
 *
 * Immutable declarative architectural normalization record.
 *
 * Records deterministic structural representation normalization after Chapter 33
 * compatible validation. Does NOT introduce runtime / execution / capability semantics.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import type { ConstructionResponsibilityStructuralCompatibilityValidationRecord } from "../construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationRecord";
import {
    ConstructionResponsibilityStructuralNormalizationIdentity,
    ConstructionResponsibilityStructuralNormalizationMetadata,
    ConstructionResponsibilityStructuralNormalizationProps,
    NormalizedStructuralRepresentation,
} from "./ConstructionResponsibilityStructuralNormalizationTypes";

/**
 * Immutable Construction Responsibility Structural Normalization Record.
 * All fields are readonly; instances are Object.freeze'd at normalization.
 */
export class ConstructionResponsibilityStructuralNormalizationRecord
    implements ConstructionResponsibilityStructuralNormalizationProps
{
    readonly identity: ConstructionResponsibilityStructuralNormalizationIdentity;
    readonly metadata: ConstructionResponsibilityStructuralNormalizationMetadata;
    readonly sourceValidationRecord: ConstructionResponsibilityStructuralCompatibilityValidationRecord;
    readonly normalizedStructuralRepresentation: NormalizedStructuralRepresentation;

    /**
     * Package-internal constructor.
     * Prefer ConstructionResponsibilityStructuralNormalizationBuilder.normalize().
     */
    constructor(init: ConstructionResponsibilityStructuralNormalizationProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceValidationRecord = init.sourceValidationRecord;
        this.normalizedStructuralRepresentation = Object.freeze({
            ...init.normalizedStructuralRepresentation,
            compatibilityConstraintIds: Object.freeze([
                ...init.normalizedStructuralRepresentation
                    .compatibilityConstraintIds,
            ]),
            requiredInputStructureIds: Object.freeze([
                ...init.normalizedStructuralRepresentation
                    .requiredInputStructureIds,
            ]),
            requiredOutputStructureIds: Object.freeze([
                ...init.normalizedStructuralRepresentation
                    .requiredOutputStructureIds,
            ]),
        });
        Object.freeze(this);
    }
}
