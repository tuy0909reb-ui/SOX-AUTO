/**
 * ASA-ARCH-47.0 — ReportContract
 */

export interface ReportContract {
    readonly contractId: "ReportContract";
    readonly outputIsHumanReviewPackage: true;
    readonly providesDecisionSupportData: true;
    readonly doesNotCreateDecisions: true;
    readonly preservesTraceability: true;
}

export function freezeReportContract(): ReportContract {
    return Object.freeze({
        contractId: "ReportContract",
        outputIsHumanReviewPackage: true,
        providesDecisionSupportData: true,
        doesNotCreateDecisions: true,
        preservesTraceability: true,
    });
}
