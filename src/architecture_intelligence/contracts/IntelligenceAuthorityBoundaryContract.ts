/**
 * ASA-ARCH-47.0 — IntelligenceAuthorityBoundaryContract
 */

export interface IntelligenceAuthorityBoundaryContract {
    readonly contractId: "IntelligenceAuthorityBoundaryContract";
    readonly designAuthority: "HUMAN_ARCHITECT";
    readonly finalAuthority: "HUMAN_ARCHITECT";
    readonly intelligenceAuthority: "NONE";
    readonly runtimeAuthority: "NONE";
    readonly decisionAuthority: "NONE";
    readonly forbidsAutomaticApproval: true;
    readonly forbidsAutomaticFreeze: true;
    readonly forbidsAuthorityReplacement: true;
    readonly providesEvidenceOnly: true;
}

export function freezeIntelligenceAuthorityBoundaryContract(): IntelligenceAuthorityBoundaryContract {
    return Object.freeze({
        contractId: "IntelligenceAuthorityBoundaryContract",
        designAuthority: "HUMAN_ARCHITECT",
        finalAuthority: "HUMAN_ARCHITECT",
        intelligenceAuthority: "NONE",
        runtimeAuthority: "NONE",
        decisionAuthority: "NONE",
        forbidsAutomaticApproval: true,
        forbidsAutomaticFreeze: true,
        forbidsAuthorityReplacement: true,
        providesEvidenceOnly: true,
    });
}
