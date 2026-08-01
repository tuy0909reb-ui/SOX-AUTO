/**
 * ASA-ARCH-47.0 — ImpactEvidence（analyzer output）
 */

import type { AnalysisStatus, EvolutionRequestIdentity } from "../types";

export interface ImpactEvidence {
    readonly kind: "ImpactEvidence";
    readonly requestId: EvolutionRequestIdentity;
    readonly status: AnalysisStatus;
    readonly affectedComponents: readonly string[];
    readonly affectedBoundaries: readonly string[];
    readonly affectedFreezeAreas: readonly string[];
    readonly dependencyChanges: readonly string[];
    readonly compatibilityImpact: readonly string[];
    readonly authorityImpact: readonly string[];
    readonly verificationRequirements: readonly string[];
    readonly immutable: true;
    readonly isAnalyticalEvidenceOnly: true;
    readonly doesNotApprove: true;
    readonly doesNotReject: true;
}

export function freezeImpactEvidence(input: {
    requestId: EvolutionRequestIdentity;
    status: AnalysisStatus;
    affectedComponents: readonly string[];
    affectedBoundaries: readonly string[];
    affectedFreezeAreas: readonly string[];
    dependencyChanges: readonly string[];
    compatibilityImpact: readonly string[];
    authorityImpact: readonly string[];
    verificationRequirements: readonly string[];
}): ImpactEvidence {
    return Object.freeze({
        kind: "ImpactEvidence",
        requestId: input.requestId,
        status: input.status,
        affectedComponents: Object.freeze([...input.affectedComponents]),
        affectedBoundaries: Object.freeze([...input.affectedBoundaries]),
        affectedFreezeAreas: Object.freeze([...input.affectedFreezeAreas]),
        dependencyChanges: Object.freeze([...input.dependencyChanges]),
        compatibilityImpact: Object.freeze([...input.compatibilityImpact]),
        authorityImpact: Object.freeze([...input.authorityImpact]),
        verificationRequirements: Object.freeze([
            ...input.verificationRequirements,
        ]),
        immutable: true,
        isAnalyticalEvidenceOnly: true,
        doesNotApprove: true,
        doesNotReject: true,
    });
}
