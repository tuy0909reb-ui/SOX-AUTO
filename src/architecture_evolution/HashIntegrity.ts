/**
 * ASA-ARCH-42.0 - Hash Integrity (Draft 0.6)
 *
 * Canonical serialization + SHA-256 for schemas, records, rules, snapshots.
 */

import { createHash } from "crypto";

/**
 * Deterministic JSON serialization with sorted object keys.
 */
export function canonicalSerialize(value: unknown): string {
    return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(sortValue);
    }
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
        sorted[key] = sortValue(obj[key]);
    }
    return sorted;
}

export function sha256Hex(canonicalText: string): string {
    return createHash("sha256").update(canonicalText, "utf8").digest("hex");
}

export function hashArtifact(value: unknown): string {
    return sha256Hex(canonicalSerialize(value));
}

export interface HashIntegrityPipeline {
    readonly steps: ReadonlyArray<
        | "ARTIFACT_CREATION"
        | "CANONICAL_SERIALIZATION"
        | "HASH_GENERATION"
        | "RECORD_STORAGE"
        | "FUTURE_VERIFICATION"
    >;
    readonly targets: ReadonlyArray<
        | "CONTRACT_SCHEMA"
        | "RECORD_SCHEMA"
        | "VALIDATION_RULE_SET"
        | "ARCHITECTURE_SNAPSHOT"
    >;
}

export function freezeHashIntegrityPipeline(): HashIntegrityPipeline {
    return Object.freeze({
        steps: Object.freeze([
            "ARTIFACT_CREATION",
            "CANONICAL_SERIALIZATION",
            "HASH_GENERATION",
            "RECORD_STORAGE",
            "FUTURE_VERIFICATION",
        ] as const),
        targets: Object.freeze([
            "CONTRACT_SCHEMA",
            "RECORD_SCHEMA",
            "VALIDATION_RULE_SET",
            "ARCHITECTURE_SNAPSHOT",
        ] as const),
    });
}
