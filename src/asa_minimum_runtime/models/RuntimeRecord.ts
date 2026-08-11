/**
 * ASA Minimum Runtime v0.1 / v0.1.1 — RuntimeRecord
 * v0.1.1: optional metadata（backward compatible hash when metadata empty/absent）
 */

export const RUNTIME_RECORD_VERSION = "1.0" as const;

export type RuntimeRecordVersion = typeof RUNTIME_RECORD_VERSION;

export interface RuntimeRecordMetadata {
    readonly tags: readonly string[];
    readonly relatedRecords: readonly string[];
    readonly source: string;
}

export const EMPTY_RUNTIME_RECORD_METADATA: RuntimeRecordMetadata =
    Object.freeze({
        tags: Object.freeze([] as string[]),
        relatedRecords: Object.freeze([] as string[]),
        source: "",
    });

export interface RuntimeRecord {
    readonly id: string;
    readonly type: string;
    readonly createdAt: string;
    readonly title: string;
    readonly content: string;
    readonly evidence: readonly string[];
    readonly metadata: RuntimeRecordMetadata;
    readonly hash: string;
    readonly version: RuntimeRecordVersion;
}

/** Payload used for canonical JSON / hash（excludes hash）. */
export interface RuntimeRecordHashPayload {
    readonly id: string;
    readonly type: string;
    readonly createdAt: string;
    readonly title: string;
    readonly content: string;
    readonly evidence: readonly string[];
    /** Absent/empty metadata omitted from canonical JSON（v0.1 digest compat）. */
    readonly metadata?: Partial<RuntimeRecordMetadata> | null;
    readonly version: RuntimeRecordVersion;
}

export interface RuntimeRecordCreateInput {
    readonly id: string;
    readonly type: string;
    readonly createdAt: string;
    readonly title: string;
    readonly content: string;
    readonly evidence?: readonly string[];
    readonly metadata?: Partial<RuntimeRecordMetadata>;
    readonly hash: string;
    readonly version?: RuntimeRecordVersion;
}

function requireNonEmpty(label: string, value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error(`${label} must be non-empty`);
    }
    return trimmed;
}

export function normalizeMetadata(
    input?: Partial<RuntimeRecordMetadata> | null
): RuntimeRecordMetadata {
    return Object.freeze({
        tags: Object.freeze(
            [...(input?.tags ?? [])].map((t) => t.trim()).filter(Boolean)
        ),
        relatedRecords: Object.freeze(
            [...(input?.relatedRecords ?? [])]
                .map((r) => r.trim())
                .filter(Boolean)
        ),
        source: (input?.source ?? "").trim(),
    });
}

/** True when metadata contributes content that must enter the hash. */
export function hasMeaningfulMetadata(
    metadata: RuntimeRecordMetadata
): boolean {
    return (
        metadata.tags.length > 0 ||
        metadata.relatedRecords.length > 0 ||
        metadata.source.length > 0
    );
}

export function toHashPayload(
    record: RuntimeRecord | RuntimeRecordHashPayload
): RuntimeRecordHashPayload {
    return Object.freeze({
        id: record.id,
        type: record.type,
        createdAt: record.createdAt,
        title: record.title,
        content: record.content,
        evidence: Object.freeze([...record.evidence]),
        metadata: normalizeMetadata(record.metadata),
        version: record.version,
    });
}

/**
 * Canonical JSON for hashing:
 * - object keys sorted
 * - evidence array order preserved
 * - hash field excluded
 * - empty/absent metadata omitted（preserves v0.1 record digests）
 * - non-empty metadata included（tags / relatedRecords / source）
 */
export function toCanonicalJson(payload: RuntimeRecordHashPayload): string {
    const ordered: Record<string, unknown> = {
        content: payload.content,
        createdAt: payload.createdAt,
        evidence: [...payload.evidence],
        id: payload.id,
        title: payload.title,
        type: payload.type,
        version: payload.version,
    };

    const metadata = normalizeMetadata(payload.metadata);
    if (hasMeaningfulMetadata(metadata)) {
        // Nested metadata object; keys sorted for stable digests.
        ordered.metadata = {
            relatedRecords: [...metadata.relatedRecords],
            source: metadata.source,
            tags: [...metadata.tags],
        };
    }

    const sortedKeys = Object.keys(ordered).sort();
    const sorted: Record<string, unknown> = {};
    for (const key of sortedKeys) {
        sorted[key] = ordered[key];
    }
    return JSON.stringify(sorted);
}

export function freezeRuntimeRecord(
    input: RuntimeRecordCreateInput
): RuntimeRecord {
    const version = input.version ?? RUNTIME_RECORD_VERSION;
    if (version !== RUNTIME_RECORD_VERSION) {
        throw new Error(
            `unsupported RuntimeRecord version: ${String(version)}`
        );
    }

    const record: RuntimeRecord = Object.freeze({
        id: requireNonEmpty("id", input.id),
        type: requireNonEmpty("type", input.type),
        createdAt: requireNonEmpty("createdAt", input.createdAt),
        title: requireNonEmpty("title", input.title),
        content: input.content,
        evidence: Object.freeze(
            (input.evidence ?? []).map((e) => e.trim()).filter(Boolean)
        ),
        metadata: normalizeMetadata(input.metadata),
        hash: requireNonEmpty("hash", input.hash),
        version: RUNTIME_RECORD_VERSION,
    });

    return record;
}
