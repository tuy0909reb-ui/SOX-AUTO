/**
 * ASA-ARCH-42.0 - Governance Recorder Module (Draft 0.6)
 *
 * Persists ArchitectureEvolutionRecord history.
 * Record Generation ≠ Approval Authority.
 */

import {
    createArchitectureEvolutionRecord,
    type ArchitectureEvolutionRecord,
} from "./ArchitectureEvolutionRecord";
import type { EvolutionRecordType } from "./ArchitectureEvolutionTypes";
import type { EvolutionProposal } from "./EvolutionProposal";
import type { CompatibilityResult } from "./CompatibilityValidator";
import type { ImpactReport } from "./ImpactReport";

export interface GovernanceRecorderRole {
    readonly roleId: "GOVERNANCE_RECORDER";
    readonly recordsHistory: true;
    readonly recordGenerationIsNotApprovalAuthority: true;
    readonly forbidsApprove: true;
    readonly forbidsFreezeAuthorize: true;
}

export function freezeGovernanceRecorderRole(): GovernanceRecorderRole {
    return Object.freeze({
        roleId: "GOVERNANCE_RECORDER" as const,
        recordsHistory: true as const,
        recordGenerationIsNotApprovalAuthority: true as const,
        forbidsApprove: true as const,
        forbidsFreezeAuthorize: true as const,
    });
}

export interface GovernanceRecordInput {
    readonly record_id: string;
    readonly proposal: EvolutionProposal;
    readonly record_type: EvolutionRecordType;
    readonly timestamp: string;
    readonly schema_version: string;
    readonly source_snapshot: string;
    readonly analysis_result: string;
    readonly approval_result: string;
    readonly freeze_result: string;
    readonly impact?: ImpactReport;
    readonly compatibility?: CompatibilityResult;
}

export function recordArchitectureEvolution(
    input: GovernanceRecordInput
): ArchitectureEvolutionRecord {
    return createArchitectureEvolutionRecord({
        schema_version: input.schema_version,
        record_id: input.record_id,
        proposal_id: input.proposal.id,
        architecture_version: input.proposal.architecture_version,
        timestamp: input.timestamp,
        record_type: input.record_type,
        source_snapshot: input.source_snapshot,
        analysis_result: input.analysis_result,
        approval_result: input.approval_result,
        freeze_result: input.freeze_result,
    });
}
