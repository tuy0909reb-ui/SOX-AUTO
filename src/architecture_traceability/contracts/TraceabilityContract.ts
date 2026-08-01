/**
 * ASA-ARCH-48.0 — TraceabilityContract
 */

export interface TraceabilityContract {
    readonly contractId: "TraceabilityContract";
    readonly isAppendOriented: true;
    readonly forbidsSilentReplacement: true;
    readonly preservesHistoricalState: true;
    readonly requiresDigestReference: true;
    readonly requiresEvidenceReference: true;
    readonly doesNotDecide: true;
}

export function freezeTraceabilityContract(): TraceabilityContract {
    return Object.freeze({
        contractId: "TraceabilityContract",
        isAppendOriented: true,
        forbidsSilentReplacement: true,
        preservesHistoricalState: true,
        requiresDigestReference: true,
        requiresEvidenceReference: true,
        doesNotDecide: true,
    });
}
