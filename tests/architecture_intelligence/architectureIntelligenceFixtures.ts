import {
    CompatibilityResult,
    RiskLevel,
    createArchitectureIdentity,
    createArchitectureVersion,
    createCandidateIdentity,
    createEvidenceIdentity,
    createEvolutionRequestIdentity,
    freezeArchitectureKnowledgeRecord,
    freezeEvolutionCandidate,
    freezeEvolutionRequest,
    freezeEvidenceRecord,
} from "../../src/architecture_intelligence";

export function sampleKnowledgeRecord() {
    return freezeArchitectureKnowledgeRecord({
        architectureId: createArchitectureIdentity("ASA-ARCH-47.0"),
        architectureVersion: createArchitectureVersion("47.0-design-1.1"),
        relationships: ["ASA-ARCH-46.0", "ASA-FOUNDATION-1.0"],
        frozenArchitectureRecords: ["ASA-ARCH-46.0-FROZEN"],
        designDecision: "Establish Architecture Intelligence Layer",
        decisionRationale:
            "Provide evidence for Human Architect evolution decisions",
        evolutionHistory: ["ASA-REGISTER-ARCH-47.0-001"],
        verificationHistory: [],
    });
}

export function sampleEvolutionRequest() {
    return freezeEvolutionRequest({
        requestId: createEvolutionRequestIdentity("EVREQ-47-001"),
        purpose: "Evaluate post-46 intelligence support",
        proposedScope: ["Architecture Support Layer", "Evidence Chain"],
    });
}

export function sampleCandidate() {
    return freezeEvolutionCandidate({
        candidateId: createCandidateIdentity("CAND-47-001"),
        purpose: "Declarative intelligence package",
        scope: ["src/architecture_intelligence/"],
        affectedBoundary: ["Architecture Support Layer"],
        risk: RiskLevel.LOW,
        compatibilityResult: CompatibilityResult.COMPATIBLE,
        verificationRequirement: [
            "Boundary Integrity",
            "Dependency Direction",
        ],
    });
}

export function sampleEvidence() {
    return freezeEvidenceRecord({
        evidenceId: createEvidenceIdentity("EVD-47-001"),
        source: "EvolutionRequest EVREQ-47-001",
        analysis: "ArchitectureImpactAnalyzer",
        result: "ImpactEvidence EVIDENCE_READY",
        trace: [
            "Requirement",
            "Architecture Change Proposal",
            "Impact Analysis",
        ],
    });
}
