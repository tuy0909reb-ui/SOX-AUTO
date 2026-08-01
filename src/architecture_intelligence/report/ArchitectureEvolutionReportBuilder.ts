/**
 * ASA-ARCH-47.0 — ArchitectureEvolutionReportBuilder
 * Builds human review packages — does not create decisions.
 */

import {
    freezeEvolutionReport,
    type EvolutionCandidate,
    type EvolutionRequest,
    type EvolutionReport,
    type ImpactEvidence,
} from "../models";

export class ArchitectureEvolutionReportBuilder {
    readonly isHumanReviewPackageBuilder = true as const;
    readonly doesNotCreateDecisions = true as const;
    readonly doesNotOwnAuthority = true as const;

    build(input: {
        currentArchitectureState: string;
        evolutionRequest: EvolutionRequest;
        impactAnalysisResult: ImpactEvidence;
        candidates: readonly EvolutionCandidate[];
        decisionSupportData?: readonly string[];
    }): EvolutionReport {
        const impact = input.impactAnalysisResult;
        return freezeEvolutionReport({
            currentArchitectureState: input.currentArchitectureState,
            evolutionRequest: input.evolutionRequest,
            impactAnalysisResult: impact,
            compatibilityResult: impact.compatibilityImpact,
            candidates: input.candidates,
            verificationPlan: impact.verificationRequirements,
            decisionSupportData: Object.freeze([
                ...(input.decisionSupportData ?? []),
                "Evidence only — Human Architect decides",
                `Request: ${String(input.evolutionRequest.requestId)}`,
            ]),
        });
    }
}

export function createArchitectureEvolutionReportBuilder(): ArchitectureEvolutionReportBuilder {
    return new ArchitectureEvolutionReportBuilder();
}
