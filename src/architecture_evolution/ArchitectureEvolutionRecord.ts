/**
 * ASA-ARCH-42.0 - ArchitectureEvolutionRecord (Draft 0.6)
 *
 * Governance history record. Record Generation ≠ Approval Authority.
 */

import type { EvolutionRecordType } from "./ArchitectureEvolutionTypes";
import { hashArtifact } from "./HashIntegrity";

export type ArchitectureEvolutionRecordField =
    | "schema_version"
    | "hash"
    | "record_id"
    | "proposal_id"
    | "architecture_version"
    | "timestamp"
    | "record_type"
    | "source_snapshot"
    | "analysis_result"
    | "approval_result"
    | "freeze_result";

export const EVOLUTION_RECORD_REQUIRED_FIELDS: ReadonlyArray<ArchitectureEvolutionRecordField> =
    Object.freeze([
        "schema_version",
        "hash",
        "record_id",
        "proposal_id",
        "architecture_version",
        "timestamp",
        "record_type",
        "source_snapshot",
        "analysis_result",
        "approval_result",
        "freeze_result",
    ]);

export interface ArchitectureEvolutionRecordBody {
    readonly schema_version: string;
    readonly record_id: string;
    readonly proposal_id: string;
    readonly architecture_version: string;
    readonly timestamp: string;
    readonly record_type: EvolutionRecordType;
    readonly source_snapshot: string;
    readonly analysis_result: string;
    readonly approval_result: string;
    readonly freeze_result: string;
}

export interface ArchitectureEvolutionRecord
    extends ArchitectureEvolutionRecordBody {
    readonly hash: string;
    readonly recordGenerationIsNotApprovalAuthority: true;
}

export function createArchitectureEvolutionRecord(
    body: ArchitectureEvolutionRecordBody
): ArchitectureEvolutionRecord {
    const hash = hashArtifact(body);
    return Object.freeze({
        ...body,
        hash,
        recordGenerationIsNotApprovalAuthority: true as const,
    });
}

export function verifyArchitectureEvolutionRecord(
    record: ArchitectureEvolutionRecord
): boolean {
    const body: ArchitectureEvolutionRecordBody = {
        schema_version: record.schema_version,
        record_id: record.record_id,
        proposal_id: record.proposal_id,
        architecture_version: record.architecture_version,
        timestamp: record.timestamp,
        record_type: record.record_type,
        source_snapshot: record.source_snapshot,
        analysis_result: record.analysis_result,
        approval_result: record.approval_result,
        freeze_result: record.freeze_result,
    };
    return hashArtifact(body) === record.hash;
}

/**
 * Replay recovers the recorded decision state from a history chain.
 * Does not re-authorize; reconstructs stored approval/freeze fields only.
 */
export function replayEvolutionDecisionState(
    records: ReadonlyArray<ArchitectureEvolutionRecord>
): {
    readonly recovered: true;
    readonly approval_result: string;
    readonly freeze_result: string;
    readonly proposal_id: string;
    readonly architecture_version: string;
} | { readonly recovered: false; readonly reason: string } {
    if (records.length === 0) {
        return { recovered: false, reason: "Empty history" };
    }
    for (const r of records) {
        if (!verifyArchitectureEvolutionRecord(r)) {
            return { recovered: false, reason: `Hash mismatch: ${r.record_id}` };
        }
    }
    const terminal =
        [...records].reverse().find((r) => r.record_type === "APPROVAL") ??
        records[records.length - 1];
    return Object.freeze({
        recovered: true as const,
        approval_result: terminal.approval_result,
        freeze_result: terminal.freeze_result,
        proposal_id: terminal.proposal_id,
        architecture_version: terminal.architecture_version,
    });
}
