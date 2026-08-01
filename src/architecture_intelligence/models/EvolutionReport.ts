/**
 * ASA-ARCH-47.0 — EvolutionReport（human review package）
 */

import type { EvolutionCandidate } from "./EvolutionCandidate";
import type { EvolutionRequest } from "./EvolutionRequest";
import type { ImpactEvidence } from "./ImpactEvidence";

export interface EvolutionReport {
    readonly kind: "EvolutionReport";
    readonly currentArchitectureState: string;
    readonly evolutionRequest: EvolutionRequest;
    readonly impactAnalysisResult: ImpactEvidence;
    readonly compatibilityResult: readonly string[];
    readonly candidates: readonly EvolutionCandidate[];
    readonly verificationPlan: readonly string[];
    readonly decisionSupportData: readonly string[];
    readonly immutable: true;
    readonly isHumanReviewPackage: true;
    readonly doesNotCreateDecisions: true;
}

export function freezeEvolutionReport(input: {
    currentArchitectureState: string;
    evolutionRequest: EvolutionRequest;
    impactAnalysisResult: ImpactEvidence;
    compatibilityResult: readonly string[];
    candidates: readonly EvolutionCandidate[];
    verificationPlan: readonly string[];
    decisionSupportData: readonly string[];
}): EvolutionReport {
    return Object.freeze({
        kind: "EvolutionReport",
        currentArchitectureState: input.currentArchitectureState.trim(),
        evolutionRequest: input.evolutionRequest,
        impactAnalysisResult: input.impactAnalysisResult,
        compatibilityResult: Object.freeze([...input.compatibilityResult]),
        candidates: Object.freeze([...input.candidates]),
        verificationPlan: Object.freeze([...input.verificationPlan]),
        decisionSupportData: Object.freeze([...input.decisionSupportData]),
        immutable: true,
        isHumanReviewPackage: true,
        doesNotCreateDecisions: true,
    });
}
