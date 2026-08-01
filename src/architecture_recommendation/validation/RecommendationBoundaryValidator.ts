import type { RecommendationSet } from "../models";
import { inspectAuthorityPreservation } from "./AuthorityPreservationValidation";
import { inspectDependencyDirection } from "./DependencyDirectionValidation";
import { inspectEvidenceLinkIntegrity } from "./EvidenceLinkIntegrityValidation";
import { inspectFrozenLayerPreservation } from "./FrozenLayerPreservationValidation";
import {
    mergeInspectionResults,
    type RecommendationInspectionResult,
} from "./inspectionResult";
import { inspectNonDecisionCompliance } from "./NonDecisionComplianceValidation";

export class RecommendationBoundaryValidator {
    readonly isInspectionOnly = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotGrantAuthority = true as const;

    inspectAll(input?: {
        recommendationSet?: RecommendationSet;
        repoRoot?: string;
    }): RecommendationInspectionResult {
        const results = [
            inspectAuthorityPreservation(),
            inspectDependencyDirection(),
            inspectFrozenLayerPreservation(input?.repoRoot),
            inspectNonDecisionCompliance(input?.recommendationSet),
        ];
        if (input?.recommendationSet) {
            results.push(inspectEvidenceLinkIntegrity(input.recommendationSet));
        }
        return mergeInspectionResults(results);
    }
}
