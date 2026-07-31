/**
 * ASA-ARCH-43.0 - Hash Integrity (Draft 0.7)
 */

import { createHash } from "crypto";

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
        | "CANONICAL_SERIALIZATION"
        | "HASH_GENERATION"
        | "EVIDENCE_STORAGE"
        | "FUTURE_VERIFICATION"
    >;
    readonly targets: ReadonlyArray<
        | "ARCHITECTURE_SNAPSHOT"
        | "CONTRACT_DEFINITION"
        | "VALIDATION_RULE_SET"
        | "EVIDENCE_RECORD"
        | "VALIDATION_RECORD"
    >;
}

export function freezeHashIntegrityPipeline(): HashIntegrityPipeline {
    return Object.freeze({
        steps: Object.freeze([
            "CANONICAL_SERIALIZATION",
            "HASH_GENERATION",
            "EVIDENCE_STORAGE",
            "FUTURE_VERIFICATION",
        ] as const),
        targets: Object.freeze([
            "ARCHITECTURE_SNAPSHOT",
            "CONTRACT_DEFINITION",
            "VALIDATION_RULE_SET",
            "EVIDENCE_RECORD",
            "VALIDATION_RECORD",
        ] as const),
    });
}
