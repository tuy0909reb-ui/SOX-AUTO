/**
 * ASA-ARCH-47.0 — ImpactContract
 * Analytical evidence only — no approve / reject.
 */

export interface ImpactContract {
    readonly contractId: "ImpactContract";
    readonly inputIsEvolutionRequest: true;
    readonly outputIsImpactEvidence: true;
    readonly forbidsApproval: true;
    readonly forbidsRejection: true;
    readonly isAnalyticalEvidenceOnly: true;
}

export function freezeImpactContract(): ImpactContract {
    return Object.freeze({
        contractId: "ImpactContract",
        inputIsEvolutionRequest: true,
        outputIsImpactEvidence: true,
        forbidsApproval: true,
        forbidsRejection: true,
        isAnalyticalEvidenceOnly: true,
    });
}
