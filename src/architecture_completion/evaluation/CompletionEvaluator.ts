/**
 * ASA-ARCH-50.0 — CompletionEvaluator
 * Deterministic: identical ArchitectureState ⇒ identical CompletionReport.
 */

import * as crypto from "crypto";
import {
    freezeArchitectureCoverage,
    freezeBaselineReference,
    freezeCompletionReport,
    type ArchitectureState,
    type CompletionReport,
} from "../models";
import {
    CompletionStatus,
    asBaselineDigest,
    asCompletionReportId,
} from "../types";

/** Required layers for current ASA evolution sequence completion boundary. */
export const REQUIRED_COMPLETION_LAYERS: readonly string[] = Object.freeze([
    "ASA-FOUNDATION-1.0",
    "ASA-ARCH-45.0",
    "ASA-ARCH-46.0",
    "ASA-ARCH-47.0",
    "ASA-ARCH-48.0",
    "ASA-ARCH-49.0",
]);

export class CompletionEvaluator {
    readonly isDeterministic = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotApprove = true as const;
    readonly doesNotAuthorizeFutureArchitecture = true as const;
    readonly doesNotFreeze = true as const;

    evaluate(state: ArchitectureState): CompletionReport {
        const required =
            state.requiredLayers.length > 0
                ? state.requiredLayers
                : REQUIRED_COMPLETION_LAYERS;

        const coverage = freezeArchitectureCoverage({
            requiredLayers: required,
            completedLayers: state.completedLayers,
        });

        const hasEvidence = state.evidenceReferences.length > 0;
        const hasVerification = state.verificationReferences.length > 0;
        const hasFreeze = state.freezeReferences.length > 0;
        const hasRepo = state.repositoryBaselineReferences.length > 0;

        let completionStatus: CompletionStatus;
        if (!hasEvidence || !hasVerification) {
            completionStatus = CompletionStatus.INSUFFICIENT_EVIDENCE;
        } else if (
            !coverage.coverageComplete ||
            !state.contractsEstablished ||
            !state.dependencyIntegrityPreserved ||
            !state.frozenBaselinesPreserved ||
            !hasFreeze ||
            !hasRepo
        ) {
            completionStatus = CompletionStatus.INCOMPLETE;
        } else {
            completionStatus = CompletionStatus.COMPLETE;
        }

        const baselineDigest = asBaselineDigest(
            this.computeBaselineDigest(state, coverage.requiredLayers)
        );

        const baselineReference = freezeBaselineReference({
            freezeReferences: state.freezeReferences,
            verificationReferences: state.verificationReferences,
            repositoryBaselineReferences: state.repositoryBaselineReferences,
            baselineDigest,
        });

        return freezeCompletionReport({
            completionReportId: asCompletionReportId(
                `COMP-${state.architectureStateHash}-${completionStatus}`
            ),
            architectureStateHash: state.architectureStateHash,
            completionStatus,
            architectureCoverage: coverage,
            evidenceReferences: state.evidenceReferences,
            verificationReferences: state.verificationReferences,
            freezeReferences: state.freezeReferences,
            baselineReference,
            baselineDigest,
        });
    }

    private computeBaselineDigest(
        state: ArchitectureState,
        requiredLayers: readonly string[]
    ): string {
        const h = crypto.createHash("sha256");
        h.update(state.architectureStateHash);
        for (const layer of requiredLayers) h.update(layer);
        for (const layer of state.completedLayers) h.update(layer);
        for (const ref of state.evidenceReferences) h.update(ref);
        for (const ref of state.verificationReferences) h.update(ref);
        for (const ref of state.freezeReferences) h.update(ref);
        for (const ref of state.repositoryBaselineReferences) h.update(ref);
        h.update(String(state.contractsEstablished));
        h.update(String(state.dependencyIntegrityPreserved));
        h.update(String(state.frozenBaselinesPreserved));
        return h.digest("hex");
    }
}
