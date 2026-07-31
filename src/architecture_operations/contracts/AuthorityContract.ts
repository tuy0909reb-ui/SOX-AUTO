/**
 * ASA-ARCH-44.0 — AuthorityContract
 * Authority boundaries for lifecycle operations.
 * Independent from lifecycle state. No automatic authority grant.
 */

export type OperationsAuthorityRole =
    | "AI_AGENT"
    | "OPERATIONS_COORDINATOR"
    | "HUMAN_ARCHITECT";

export interface AuthorityContract {
    readonly contractId: "AuthorityContract";
    readonly finalAuthority: "HUMAN_ARCHITECT";
    readonly operationalAuthority: "OPERATIONS_COORDINATOR";
    readonly aiPermission: "PROPOSAL_ONLY";
    readonly freezeApproval: "HUMAN_ARCHITECT";
    readonly supersedeApproval: "HUMAN_ARCHITECT";
    readonly forbidsAiFreezeAuthorization: true;
    readonly forbidsAiFrozenArtifactModification: true;
    readonly forbidsAiAuthorityModelApplication: true;
    readonly forbidsCoordinatorIndependentFreeze: true;
    readonly forbidsCoordinatorAuthorityOverride: true;
    readonly authorityIndependentFromLifecycleState: true;
}

export function freezeAuthorityContract(): AuthorityContract {
    return Object.freeze({
        contractId: "AuthorityContract",
        finalAuthority: "HUMAN_ARCHITECT",
        operationalAuthority: "OPERATIONS_COORDINATOR",
        aiPermission: "PROPOSAL_ONLY",
        freezeApproval: "HUMAN_ARCHITECT",
        supersedeApproval: "HUMAN_ARCHITECT",
        forbidsAiFreezeAuthorization: true,
        forbidsAiFrozenArtifactModification: true,
        forbidsAiAuthorityModelApplication: true,
        forbidsCoordinatorIndependentFreeze: true,
        forbidsCoordinatorAuthorityOverride: true,
        authorityIndependentFromLifecycleState: true,
    });
}
