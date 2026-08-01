/**
 * ASA-ARCH-47.0 — KnowledgeContract
 * Architecture Record = Identity + Relationship + Decision + Rationale + Verification
 */

export interface KnowledgeContract {
    readonly contractId: "KnowledgeContract";
    readonly requiresIdentity: true;
    readonly requiresRelationship: true;
    readonly requiresDecision: true;
    readonly requiresRationale: true;
    readonly requiresVerification: true;
    readonly preservesHistoricalContext: true;
    readonly doesNotDecide: true;
}

export function freezeKnowledgeContract(): KnowledgeContract {
    return Object.freeze({
        contractId: "KnowledgeContract",
        requiresIdentity: true,
        requiresRelationship: true,
        requiresDecision: true,
        requiresRationale: true,
        requiresVerification: true,
        preservesHistoricalContext: true,
        doesNotDecide: true,
    });
}
