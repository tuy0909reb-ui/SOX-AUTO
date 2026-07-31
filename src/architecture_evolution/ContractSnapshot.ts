/**
 * ASA-ARCH-42.0 - Contract Snapshot Model (Draft 0.6)
 *
 * Immutable / Versioned / Referenceable snapshots for evolution analysis.
 */

import type { ContractSnapshotKind } from "./ArchitectureEvolutionTypes";
import {
    canonicalSerialize,
    sha256Hex,
} from "./HashIntegrity";

export interface ContractSnapshot {
    readonly snapshotId: string;
    readonly kind: ContractSnapshotKind;
    readonly version: string;
    readonly architecture_version: string;
    readonly timestamp: string;
    readonly payload: Readonly<Record<string, unknown>>;
    readonly hash: string;
    readonly immutable: true;
    readonly versioned: true;
    readonly referenceable: true;
}

export function createContractSnapshot(input: {
    readonly snapshotId: string;
    readonly kind: ContractSnapshotKind;
    readonly version: string;
    readonly architecture_version: string;
    readonly timestamp: string;
    readonly payload: Record<string, unknown>;
}): ContractSnapshot {
    const frozenPayload = Object.freeze({ ...input.payload });
    const hash = sha256Hex(
        canonicalSerialize({
            snapshotId: input.snapshotId,
            kind: input.kind,
            version: input.version,
            architecture_version: input.architecture_version,
            timestamp: input.timestamp,
            payload: frozenPayload,
        })
    );
    return Object.freeze({
        snapshotId: input.snapshotId,
        kind: input.kind,
        version: input.version,
        architecture_version: input.architecture_version,
        timestamp: input.timestamp,
        payload: frozenPayload,
        hash,
        immutable: true as const,
        versioned: true as const,
        referenceable: true as const,
    });
}

export function verifyContractSnapshot(
    snapshot: ContractSnapshot
): boolean {
    const expected = sha256Hex(
        canonicalSerialize({
            snapshotId: snapshot.snapshotId,
            kind: snapshot.kind,
            version: snapshot.version,
            architecture_version: snapshot.architecture_version,
            timestamp: snapshot.timestamp,
            payload: snapshot.payload,
        })
    );
    return expected === snapshot.hash;
}
