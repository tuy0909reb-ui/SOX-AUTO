/**
 * ASA-ARCH-48.0 — TraceabilityAuthorityBoundaryContract
 */

export interface TraceabilityAuthorityBoundaryContract {
    readonly contractId: "TraceabilityAuthorityBoundaryContract";
    readonly designAuthority: "HUMAN_ARCHITECT";
    readonly finalAuthority: "HUMAN_ARCHITECT";
    readonly traceabilityAuthority: "NONE";
    readonly runtimeAuthority: "NONE";
    readonly decisionAuthority: "NONE";
    readonly forbidsApprovalLogic: true;
    readonly forbidsFreezeAuthority: true;
    readonly forbidsAutomaticModification: true;
    readonly providesTraceVisibilityOnly: true;
}

export function freezeTraceabilityAuthorityBoundaryContract(): TraceabilityAuthorityBoundaryContract {
    return Object.freeze({
        contractId: "TraceabilityAuthorityBoundaryContract",
        designAuthority: "HUMAN_ARCHITECT",
        finalAuthority: "HUMAN_ARCHITECT",
        traceabilityAuthority: "NONE",
        runtimeAuthority: "NONE",
        decisionAuthority: "NONE",
        forbidsApprovalLogic: true,
        forbidsFreezeAuthority: true,
        forbidsAutomaticModification: true,
        providesTraceVisibilityOnly: true,
    });
}
