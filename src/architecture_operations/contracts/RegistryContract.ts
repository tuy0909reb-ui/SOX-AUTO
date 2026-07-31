/**
 * ASA-ARCH-44.0 — RegistryContract
 * Immutable Architecture Lifecycle Ledger contract.
 * Identity / History / Integrity / Lookup.
 */

export interface RegistryContract {
    readonly contractId: "RegistryContract";
    readonly providesIdentity: true;
    readonly providesHistory: true;
    readonly providesIntegrity: true;
    readonly providesLookup: true;
    readonly appendOnly: true;
    readonly forbidsOverwrite: true;
    readonly hashVerifiable: true;
    readonly referenceable: true;
    readonly doesNotDecideTransitions: true;
    readonly doesNotAuthorizeChanges: true;
    readonly doesNotValidateArchitectureCorrectness: true;
    readonly doesNotCreateApprovals: true;
    readonly doesNotGenerateDecisions: true;
    readonly doesNotEvaluateReferenceMeaning: true;
}

export function freezeRegistryContract(): RegistryContract {
    return Object.freeze({
        contractId: "RegistryContract",
        providesIdentity: true,
        providesHistory: true,
        providesIntegrity: true,
        providesLookup: true,
        appendOnly: true,
        forbidsOverwrite: true,
        hashVerifiable: true,
        referenceable: true,
        doesNotDecideTransitions: true,
        doesNotAuthorizeChanges: true,
        doesNotValidateArchitectureCorrectness: true,
        doesNotCreateApprovals: true,
        doesNotGenerateDecisions: true,
        doesNotEvaluateReferenceMeaning: true,
    });
}
