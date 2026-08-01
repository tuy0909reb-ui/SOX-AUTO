/**
 * ASA-ARCH-46.0 — EvolutionLifecycleDeclarationContract
 */

export interface EvolutionLifecycleDeclarationContract {
    readonly contractId: "EvolutionLifecycleDeclarationContract";
    readonly isDeclarationOnly: true;
    readonly forbidsRuntimeActivation: true;
    readonly forbidsLifecycleBypass: true;
    readonly requiresVerificationBeforeRegistration: true;
    readonly requiresRegistrationBeforeFreeze: true;
}

export function freezeEvolutionLifecycleDeclarationContract(): EvolutionLifecycleDeclarationContract {
    return Object.freeze({
        contractId: "EvolutionLifecycleDeclarationContract",
        isDeclarationOnly: true,
        forbidsRuntimeActivation: true,
        forbidsLifecycleBypass: true,
        requiresVerificationBeforeRegistration: true,
        requiresRegistrationBeforeFreeze: true,
    });
}
