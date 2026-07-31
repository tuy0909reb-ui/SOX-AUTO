/**
 * ASA-ARCH-43.0 - Evidence Collector / Health Reporter / Validation Recorder
 * (Draft 0.7)
 */

import {
    freezeArchitectureHealthReport,
    type ArchitectureHealthReport,
} from "./ArchitectureHealthReport";
import type { HealthRecommendation, ValidationStatus } from "./ArchitectureValidationTypes";
import { hashArtifact } from "./HashIntegrity";
import {
    createValidationEvidenceRecord,
    type ValidationEvidenceRecord,
    verifyValidationEvidenceRecord,
} from "./ValidationEvidence";

export interface EvidenceCollectorRole {
    readonly roleId: "EVIDENCE_COLLECTOR";
    readonly producesImmutableEvidence: true;
}

export function freezeEvidenceCollectorRole(): EvidenceCollectorRole {
    return Object.freeze({
        roleId: "EVIDENCE_COLLECTOR" as const,
        producesImmutableEvidence: true as const,
    });
}

export function collectValidationEvidence(input: {
    readonly id: string;
    readonly validation_id: string;
    readonly snapshot_hash: string;
    readonly contract_hash: string;
    readonly rule_set_hash: string;
    readonly generated_at: string;
    readonly validator_version?: string;
}): ValidationEvidenceRecord {
    return createValidationEvidenceRecord(input);
}

export interface HealthReporterRole {
    readonly roleId: "HEALTH_REPORTER";
    readonly recommendationIsNotDecision: true;
}

export function freezeHealthReporterRole(): HealthReporterRole {
    return Object.freeze({
        roleId: "HEALTH_REPORTER" as const,
        recommendationIsNotDecision: true as const,
    });
}

export function generateArchitectureHealthReport(input: {
    readonly id: string;
    readonly architecture_version: string;
    readonly timestamp: string;
    readonly contract_status: ValidationStatus;
    readonly boundary_status: ValidationStatus;
    readonly freeze_status: ValidationStatus;
    readonly integrity_status: ValidationStatus;
    readonly drift_detected: boolean;
    readonly evidence_hash: string;
}): ArchitectureHealthReport {
    const statuses = [
        input.contract_status,
        input.boundary_status,
        input.freeze_status,
        input.integrity_status,
    ];
    const anyFail = statuses.includes("FAIL") || input.drift_detected;
    const validation_result: ValidationStatus = anyFail ? "FAIL" : "PASS";
    let recommendation: HealthRecommendation = "NONE";
    if (input.drift_detected && anyFail) {
        recommendation = "INVESTIGATION_REQUIRED";
    } else if (anyFail) {
        recommendation = "REVIEW_REQUIRED";
    } else if (input.drift_detected) {
        recommendation = "MANUAL_VALIDATION_REQUIRED";
    }
    return freezeArchitectureHealthReport({
        ...input,
        validation_result,
        recommendation,
    });
}

export interface ValidationHistoryRecord {
    readonly record_id: string;
    readonly validation_id: string;
    readonly architecture_version: string;
    readonly timestamp: string;
    readonly status: ValidationStatus;
    readonly evidence_reference: string;
    readonly report_snapshot: string;
    readonly record_hash: string;
    readonly recordIsNotCorrectionAuthority: true;
}

export interface ValidationRecorderRole {
    readonly roleId: "VALIDATION_RECORDER";
    readonly recordIsNotCorrectionAuthority: true;
}

export function freezeValidationRecorderRole(): ValidationRecorderRole {
    return Object.freeze({
        roleId: "VALIDATION_RECORDER" as const,
        recordIsNotCorrectionAuthority: true as const,
    });
}

export function recordValidationHistory(input: {
    readonly record_id: string;
    readonly validation_id: string;
    readonly architecture_version: string;
    readonly timestamp: string;
    readonly status: ValidationStatus;
    readonly evidence_reference: string;
    readonly report_snapshot: string;
}): ValidationHistoryRecord {
    const body = {
        record_id: input.record_id,
        validation_id: input.validation_id,
        architecture_version: input.architecture_version,
        timestamp: input.timestamp,
        status: input.status,
        evidence_reference: input.evidence_reference,
        report_snapshot: input.report_snapshot,
    };
    return Object.freeze({
        ...body,
        record_hash: hashArtifact(body),
        recordIsNotCorrectionAuthority: true as const,
    });
}

export function verifyValidationHistoryRecord(
    record: ValidationHistoryRecord
): boolean {
    const body = {
        record_id: record.record_id,
        validation_id: record.validation_id,
        architecture_version: record.architecture_version,
        timestamp: record.timestamp,
        status: record.status,
        evidence_reference: record.evidence_reference,
        report_snapshot: record.report_snapshot,
    };
    return hashArtifact(body) === record.record_hash;
}

/**
 * Replay recovers original validation state from history.
 * Does not re-authorize or correct architecture.
 */
export function replayValidationReport(
    records: ReadonlyArray<ValidationHistoryRecord>
): {
    readonly recovered: true;
    readonly status: ValidationStatus;
    readonly evidence_reference: string;
    readonly validation_id: string;
    readonly architecture_version: string;
} | { readonly recovered: false; readonly reason: string } {
    if (records.length === 0) {
        return { recovered: false, reason: "Empty history" };
    }
    for (const r of records) {
        if (!verifyValidationHistoryRecord(r)) {
            return { recovered: false, reason: `Hash mismatch: ${r.record_id}` };
        }
    }
    const terminal = records[records.length - 1];
    return Object.freeze({
        recovered: true as const,
        status: terminal.status,
        evidence_reference: terminal.evidence_reference,
        validation_id: terminal.validation_id,
        architecture_version: terminal.architecture_version,
    });
}

export { verifyValidationEvidenceRecord };
