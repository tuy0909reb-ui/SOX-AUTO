import type { CompletionReport } from "../models";
import {
    freezeInspectionResult,
    type CompletionInspectionResult,
} from "./inspectionResult";

export function inspectEvidenceReferenceIntegrity(
    report: CompletionReport
): CompletionInspectionResult {
    const findings: string[] = [];
    if (!report.architectureStateHash) {
        findings.push("missing architectureStateHash");
    }
    if (report.evidenceReferences.length === 0) {
        findings.push("missing evidenceReferences");
    }
    if (report.verificationReferences.length === 0) {
        findings.push("missing verificationReferences");
    }
    if (!report.baselineDigest) {
        findings.push("missing baselineDigest");
    }
    if (
        report.baselineReference.baselineDigest !== report.baselineDigest
    ) {
        findings.push("baselineDigest mismatch with baselineReference");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
