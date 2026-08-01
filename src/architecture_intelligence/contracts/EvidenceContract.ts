/**
 * ASA-ARCH-47.0 — EvidenceContract
 * Evidence Record = Source + Analysis + Result + Trace
 */

export interface EvidenceContract {
    readonly contractId: "EvidenceContract";
    readonly requiresSource: true;
    readonly requiresAnalysis: true;
    readonly requiresResult: true;
    readonly requiresTrace: true;
    readonly maintainsAccountability: true;
}

export function freezeEvidenceContract(): EvidenceContract {
    return Object.freeze({
        contractId: "EvidenceContract",
        requiresSource: true,
        requiresAnalysis: true,
        requiresResult: true,
        requiresTrace: true,
        maintainsAccountability: true,
    });
}
