/**
 * ASA-ARCH-50.0 — CompletionReport（completion evidence only）
 */

import type {
    ArchitectureStateHash,
    BaselineDigest,
    CompletionReportId,
    CompletionStatus,
    EvidenceReference,
    FreezeReference,
    VerificationReference,
} from "../types";
import type { ArchitectureCoverage } from "./ArchitectureCoverage";
import type { BaselineReference } from "./BaselineReference";

export interface CompletionReport {
    readonly kind: "CompletionReport";
    readonly completionReportId: CompletionReportId;
    readonly architectureStateHash: ArchitectureStateHash;
    readonly completionStatus: CompletionStatus;
    readonly architectureCoverage: ArchitectureCoverage;
    readonly evidenceReferences: readonly EvidenceReference[];
    readonly verificationReferences: readonly VerificationReference[];
    readonly freezeReferences: readonly FreezeReference[];
    readonly baselineReference: BaselineReference;
    readonly baselineDigest: BaselineDigest;
    readonly evolutionDecision: null;
    readonly approvalResult: null;
    readonly executionInstruction: null;
    readonly futureArchitectureAuthorization: null;
    readonly immutable: true;
    readonly doesNotDecide: true;
}

export function freezeCompletionReport(input: {
    completionReportId: CompletionReportId;
    architectureStateHash: ArchitectureStateHash;
    completionStatus: CompletionStatus;
    architectureCoverage: ArchitectureCoverage;
    evidenceReferences: readonly EvidenceReference[];
    verificationReferences: readonly VerificationReference[];
    freezeReferences: readonly FreezeReference[];
    baselineReference: BaselineReference;
    baselineDigest: BaselineDigest;
}): CompletionReport {
    return Object.freeze({
        kind: "CompletionReport",
        completionReportId: input.completionReportId,
        architectureStateHash: input.architectureStateHash,
        completionStatus: input.completionStatus,
        architectureCoverage: input.architectureCoverage,
        evidenceReferences: Object.freeze([...input.evidenceReferences]),
        verificationReferences: Object.freeze([
            ...input.verificationReferences,
        ]),
        freezeReferences: Object.freeze([...input.freezeReferences]),
        baselineReference: input.baselineReference,
        baselineDigest: input.baselineDigest,
        evolutionDecision: null,
        approvalResult: null,
        executionInstruction: null,
        futureArchitectureAuthorization: null,
        immutable: true,
        doesNotDecide: true,
    });
}
