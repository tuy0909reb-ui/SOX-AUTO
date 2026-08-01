/**
 * ASA-ARCH-46.0 — EvolutionBoundaryValidator
 * Inspection composition only — does not decide or grant authority.
 */

import type { EvolutionDependencyBoundaryContract } from "../contracts";
import type {
    EvolutionValidator,
    EvolutionValidationInspectionResult,
} from "../interfaces";
import type { EvolutionRegistryRecord } from "../models";
import { inspectAuthorityPreservation } from "./AuthorityPreservationValidation";
import { inspectDependencyDirection } from "./DependencyDirectionValidation";
import { inspectFoundationCompatibility } from "./FoundationCompatibilityValidation";
import { inspectFrozenLayerPreservation } from "./FrozenLayerPreservationValidation";
import { mergeInspectionResults } from "./inspectionResult";
import { inspectProhibitedCapabilities } from "./ProhibitedCapabilityValidation";

export class EvolutionBoundaryValidator implements EvolutionValidator {
    readonly role = "EvolutionValidator" as const;
    readonly isInspectionOnly = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotGrantAuthority = true as const;

    inspectAll(input?: {
        record?: EvolutionRegistryRecord;
        dependencyContract?: EvolutionDependencyBoundaryContract;
        layerSurface?: Record<string, unknown>;
        repoRoot?: string;
    }): EvolutionValidationInspectionResult {
        return mergeInspectionResults([
            inspectFoundationCompatibility(),
            inspectDependencyDirection(
                input?.dependencyContract,
                input?.record
            ),
            inspectAuthorityPreservation(),
            inspectProhibitedCapabilities(input?.layerSurface ?? {}),
            inspectFrozenLayerPreservation(input?.repoRoot),
        ]);
    }
}

export function createEvolutionBoundaryValidator(): EvolutionBoundaryValidator {
    return new EvolutionBoundaryValidator();
}
