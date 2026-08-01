/**
 * ASA-ARCH-47.0 — IntelligenceBoundaryValidator
 */

import { inspectAuthorityPreservation } from "./AuthorityPreservationValidation";
import { inspectDependencyDirection } from "./DependencyDirectionValidation";
import { inspectFrozenLayerPreservation } from "./FrozenLayerPreservationValidation";
import {
    mergeInspectionResults,
    type IntelligenceInspectionResult,
} from "./inspectionResult";

export class IntelligenceBoundaryValidator {
    readonly isInspectionOnly = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotGrantAuthority = true as const;

    inspectAll(input?: {
        repoRoot?: string;
    }): IntelligenceInspectionResult {
        return mergeInspectionResults([
            inspectAuthorityPreservation(),
            inspectDependencyDirection(),
            inspectFrozenLayerPreservation(input?.repoRoot),
        ]);
    }
}

export function createIntelligenceBoundaryValidator(): IntelligenceBoundaryValidator {
    return new IntelligenceBoundaryValidator();
}
