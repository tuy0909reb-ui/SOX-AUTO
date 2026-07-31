/**
 * ASA-ARCH-43.0 - Validation Evidence Record (Draft 0.7)
 *
 * Immutable / Versioned / Referenceable / Hash Verified.
 * Separated from Canonical Architecture Source.
 */

import { hashArtifact } from "./HashIntegrity";

export interface ValidationEvidenceRecordBody {
    readonly id: string;
    readonly validation_id: string;
    readonly snapshot_hash: string;
    readonly contract_hash: string;
    readonly rule_set_hash: string;
    readonly generated_at: string;
    readonly validator_version?: string;
}

export interface ValidationEvidenceRecord extends ValidationEvidenceRecordBody {
    readonly record_hash: string;
    readonly immutable: true;
    readonly versioned: true;
    readonly referenceable: true;
    readonly separatedFromCanonicalSource: true;
}

export function createValidationEvidenceRecord(
    body: ValidationEvidenceRecordBody
): ValidationEvidenceRecord {
    const record_hash = hashArtifact(body);
    return Object.freeze({
        ...body,
        record_hash,
        immutable: true as const,
        versioned: true as const,
        referenceable: true as const,
        separatedFromCanonicalSource: true as const,
    });
}

export function verifyValidationEvidenceRecord(
    record: ValidationEvidenceRecord
): boolean {
    const body: ValidationEvidenceRecordBody = {
        id: record.id,
        validation_id: record.validation_id,
        snapshot_hash: record.snapshot_hash,
        contract_hash: record.contract_hash,
        rule_set_hash: record.rule_set_hash,
        generated_at: record.generated_at,
        validator_version: record.validator_version,
    };
    return hashArtifact(body) === record.record_hash;
}
