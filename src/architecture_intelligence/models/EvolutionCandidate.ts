/**
 * ASA-ARCH-47.0 — EvolutionCandidate
 * Human-reviewed alternative representation — not autonomous architecture creation.
 */

import type {
    CandidateIdentity,
    CompatibilityResult,
    RiskLevel,
} from "../types";

export interface EvolutionCandidate {
    readonly kind: "EvolutionCandidate";
    readonly candidateId: CandidateIdentity;
    readonly purpose: string;
    readonly scope: readonly string[];
    readonly affectedBoundary: readonly string[];
    readonly risk: RiskLevel;
    readonly compatibilityResult: CompatibilityResult;
    readonly verificationRequirement: readonly string[];
    readonly immutable: true;
    readonly doesNotCreateArchitecture: true;
}

export function freezeEvolutionCandidate(input: {
    candidateId: CandidateIdentity;
    purpose: string;
    scope: readonly string[];
    affectedBoundary: readonly string[];
    risk: RiskLevel;
    compatibilityResult: CompatibilityResult;
    verificationRequirement: readonly string[];
}): EvolutionCandidate {
    return Object.freeze({
        kind: "EvolutionCandidate",
        candidateId: input.candidateId,
        purpose: input.purpose.trim(),
        scope: Object.freeze([...input.scope]),
        affectedBoundary: Object.freeze([...input.affectedBoundary]),
        risk: input.risk,
        compatibilityResult: input.compatibilityResult,
        verificationRequirement: Object.freeze([
            ...input.verificationRequirement,
        ]),
        immutable: true,
        doesNotCreateArchitecture: true,
    });
}
