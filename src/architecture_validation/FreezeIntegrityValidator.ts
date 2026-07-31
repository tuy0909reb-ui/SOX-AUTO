/**
 * ASA-ARCH-43.0 - Freeze Integrity Validator (Draft 0.7)
 */

import {
    freezeFreezeIntegrityResult,
    type FreezeIntegrityResult,
} from "./ValidationResultContracts";

export interface FreezeRecordRef {
    readonly freezeId: string;
    readonly artifactHash: string;
    readonly freezeState: "FROZEN" | "PENDING" | "UNAUTHORIZED";
}

export interface FreezeIntegrityValidatorRole {
    readonly roleId: "FREEZE_INTEGRITY_VALIDATOR";
    readonly forbidsApproveFreeze: true;
}

export function freezeFreezeIntegrityValidatorRole(): FreezeIntegrityValidatorRole {
    return Object.freeze({
        roleId: "FREEZE_INTEGRITY_VALIDATOR" as const,
        forbidsApproveFreeze: true as const,
    });
}

export function validateFreezeIntegrity(input: {
    readonly id: string;
    readonly freeze: FreezeRecordRef;
    readonly currentSnapshotHash: string;
    readonly evidence_reference: string;
}): FreezeIntegrityResult {
    const hashMismatch = input.freeze.artifactHash !== input.currentSnapshotHash;
    const stateOk = input.freeze.freezeState === "FROZEN";
    const status =
        !hashMismatch && stateOk ? ("PASS" as const) : ("FAIL" as const);
    return freezeFreezeIntegrityResult({
        id: input.id,
        freeze_reference: input.freeze.freezeId,
        hash_before: input.freeze.artifactHash,
        hash_current: input.currentSnapshotHash,
        rule_reference: "RULE-103",
        status,
        evidence_reference: input.evidence_reference,
    });
}
