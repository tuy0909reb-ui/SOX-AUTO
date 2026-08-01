import type { TraceRegistry } from "../registry";
import { inspectAuthorityPreservation } from "./AuthorityPreservationValidation";
import { inspectFrozenLayerPreservation } from "./FrozenLayerPreservationValidation";
import {
    mergeInspectionResults,
    type TraceabilityInspectionResult,
} from "./inspectionResult";
import { inspectTraceCompleteness } from "./TraceCompletenessValidation";

export class TraceabilityBoundaryValidator {
    readonly isInspectionOnly = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotGrantAuthority = true as const;

    inspectAll(input?: {
        registry?: TraceRegistry;
        sourceArtifact?: string;
        repoRoot?: string;
    }): TraceabilityInspectionResult {
        const results = [
            inspectAuthorityPreservation(),
            inspectFrozenLayerPreservation(input?.repoRoot),
        ];
        if (input?.registry && input.sourceArtifact) {
            results.push(
                inspectTraceCompleteness(input.registry, input.sourceArtifact)
            );
        }
        return mergeInspectionResults(results);
    }
}
