import type { CompletionReport } from "../models";
import { inspectAuthorityPreservation } from "./AuthorityPreservationValidation";
import { inspectDependencyDirection } from "./DependencyDirectionValidation";
import { inspectEvidenceReferenceIntegrity } from "./EvidenceReferenceValidation";
import { inspectFrozenLayerPreservation } from "./FrozenLayerPreservationValidation";
import {
    mergeInspectionResults,
    type CompletionInspectionResult,
} from "./inspectionResult";
import { inspectNonEvolutionDecision } from "./NonEvolutionDecisionValidation";

export class CompletionBoundaryValidator {
    readonly isInspectionOnly = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotGrantAuthority = true as const;

    inspectAll(input?: {
        completionReport?: CompletionReport;
        repoRoot?: string;
    }): CompletionInspectionResult {
        const results = [
            inspectAuthorityPreservation(),
            inspectDependencyDirection(),
            inspectFrozenLayerPreservation(input?.repoRoot),
            inspectNonEvolutionDecision(input?.completionReport),
        ];
        if (input?.completionReport) {
            results.push(
                inspectEvidenceReferenceIntegrity(input.completionReport)
            );
        }
        return mergeInspectionResults(results);
    }
}
