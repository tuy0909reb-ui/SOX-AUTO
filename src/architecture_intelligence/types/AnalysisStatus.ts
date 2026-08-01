/**
 * ASA-ARCH-47.0 — AnalysisStatus
 * Analytical declaration only — not approval / rejection.
 */

export enum AnalysisStatus {
    OBSERVED = "OBSERVED",
    ANALYZED = "ANALYZED",
    EVIDENCE_READY = "EVIDENCE_READY",
    REPORTED = "REPORTED",
}

export const ANALYSIS_STATUSES: readonly AnalysisStatus[] = Object.freeze([
    AnalysisStatus.OBSERVED,
    AnalysisStatus.ANALYZED,
    AnalysisStatus.EVIDENCE_READY,
    AnalysisStatus.REPORTED,
]);

export function isAnalysisStatus(value: string): value is AnalysisStatus {
    return (ANALYSIS_STATUSES as readonly string[]).includes(value);
}
