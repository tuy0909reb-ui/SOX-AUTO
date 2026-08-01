/**
 * ASA-ARCH-49.0 — RecommendationAuthorityBoundaryContract
 */

export interface RecommendationAuthorityBoundaryContract {
    readonly contractId: "RecommendationAuthorityBoundaryContract";
    readonly designAuthority: "HUMAN_ARCHITECT";
    readonly finalAuthority: "HUMAN_ARCHITECT";
    readonly recommendationAuthority: "STRUCTURAL_ONLY";
    readonly decisionAuthority: "NONE";
    readonly approvalAuthority: "NONE";
    readonly implementationAuthorizationAuthority: "NONE";
    readonly freezeAuthority: "NONE";
    readonly runtimeAuthority: "NONE";
    readonly forbidsAutomaticArchitectureCreation: true;
    readonly forbidsAutomaticModification: true;
    readonly providesRecommendationOnly: true;
}

export function freezeRecommendationAuthorityBoundaryContract(): RecommendationAuthorityBoundaryContract {
    return Object.freeze({
        contractId: "RecommendationAuthorityBoundaryContract",
        designAuthority: "HUMAN_ARCHITECT",
        finalAuthority: "HUMAN_ARCHITECT",
        recommendationAuthority: "STRUCTURAL_ONLY",
        decisionAuthority: "NONE",
        approvalAuthority: "NONE",
        implementationAuthorizationAuthority: "NONE",
        freezeAuthority: "NONE",
        runtimeAuthority: "NONE",
        forbidsAutomaticArchitectureCreation: true,
        forbidsAutomaticModification: true,
        providesRecommendationOnly: true,
    });
}
