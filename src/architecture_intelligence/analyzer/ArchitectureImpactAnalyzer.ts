/**
 * ASA-ARCH-47.0 — ArchitectureImpactAnalyzer
 * Deterministic analytical evidence only — does not approve or reject.
 */

import {
    freezeImpactEvidence,
    type EvolutionRequest,
    type ImpactEvidence,
} from "../models";
import { AnalysisStatus } from "../types";

export class ArchitectureImpactAnalyzer {
    readonly isAnalyticalEvidenceOnly = true as const;
    readonly doesNotApprove = true as const;
    readonly doesNotReject = true as const;
    readonly doesNotOwnAuthority = true as const;

    analyze(request: EvolutionRequest): ImpactEvidence {
        if (!request.immutable || !Object.isFrozen(request)) {
            throw new Error("EvolutionRequest must be immutable");
        }

        const scope = request.proposedScope;
        const touchesFoundation = scope.some((s) =>
            s.toUpperCase().includes("FOUNDATION")
        );
        const touchesFrozen = scope.some(
            (s) =>
                s.toUpperCase().includes("FROZEN") ||
                /ASA-ARCH-\d+/i.test(s)
        );

        const affectedFreezeAreas: string[] = [];
        if (touchesFoundation) {
            affectedFreezeAreas.push("ASA-FOUNDATION-1.0");
        }
        if (touchesFrozen) {
            affectedFreezeAreas.push("Frozen Architecture Chapters");
        }

        const verificationRequirements = Object.freeze([
            "Boundary Integrity",
            "Dependency Direction",
            "Contract Compliance",
            ...(touchesFoundation
                ? (["Foundation Hash Preservation"] as const)
                : []),
        ]);

        return freezeImpactEvidence({
            requestId: request.requestId,
            status: AnalysisStatus.EVIDENCE_READY,
            affectedComponents: scope,
            affectedBoundaries: Object.freeze([
                "Architecture Support Layer",
                ...(touchesFoundation
                    ? (["Foundation Boundary"] as const)
                    : []),
            ]),
            affectedFreezeAreas: Object.freeze(affectedFreezeAreas),
            dependencyChanges: Object.freeze([
                "Frozen→Knowledge→Analysis→Evidence（must preserve）",
            ]),
            compatibilityImpact: Object.freeze([
                touchesFoundation
                    ? "Foundation compatibility review REQUIRED"
                    : "Foundation untouched by declared scope",
            ]),
            authorityImpact: Object.freeze([
                "HUMAN_ARCHITECT remains final authority",
                "No automatic approval / reject / freeze",
            ]),
            verificationRequirements,
        });
    }
}

export function createArchitectureImpactAnalyzer(): ArchitectureImpactAnalyzer {
    return new ArchitectureImpactAnalyzer();
}
