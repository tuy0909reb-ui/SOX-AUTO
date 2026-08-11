/**
 * ASA Minimum Runtime — RecordCommitAPI
 * Write Discipline Slice: single official write path.
 *
 * Composition only: HashService → JsonFileStorage.save → HistoryService.append
 * Does not reimplement hash/storage/history semantics.
 *
 * Partial failure note:
 * Order is save then history. If history.append fails after save,
 * Storage may retain an Unofficial artifact. Per P0 we do NOT auto-delete.
 * Detect via Verify HISTORY_MISSING. No DB/transaction framework.
 */

import * as crypto from "crypto";
import { HashService } from "../hash";
import { HistoryService } from "../history";
import {
    freezeRuntimeRecord,
    RUNTIME_RECORD_VERSION,
    type RuntimeRecord,
    type RuntimeRecordMetadata,
} from "../models";
import { JsonFileStorage } from "../storage";

export interface RecordCommitInput {
    readonly type: string;
    readonly title: string;
    readonly content?: string;
    readonly evidence?: readonly string[];
    readonly metadata?: Partial<RuntimeRecordMetadata>;
    /** Test/DI only. Production callers should omit（auto UUID）. */
    readonly id?: string;
    /** Test/DI only. Production callers should omit（Commit time ISO）. */
    readonly createdAt?: string;
}

export interface RecordCommitResult {
    readonly record: RuntimeRecord;
    readonly path: string;
}

export interface RecordCommitAPIOptions {
    readonly storage?: JsonFileStorage;
    readonly history?: HistoryService;
    readonly hashService?: HashService;
    readonly now?: () => Date;
    readonly randomId?: () => string;
}

export class RecordCommitPartialError extends Error {
    readonly code = "COMMIT_PARTIAL_STORAGE" as const;
    readonly recordId: string;
    readonly recordPath: string;

    constructor(input: {
        recordId: string;
        recordPath: string;
        cause: unknown;
    }) {
        const causeMsg =
            input.cause instanceof Error ? input.cause.message : String(input.cause);
        super(
            `COMMIT_PARTIAL_STORAGE: storage saved but history append failed for ${input.recordId}: ${causeMsg}`
        );
        this.name = "RecordCommitPartialError";
        this.recordId = input.recordId;
        this.recordPath = input.recordPath;
    }
}

export class RecordCommitAPI {
    private readonly storage: JsonFileStorage;
    private readonly history: HistoryService;
    private readonly hashService: HashService;
    private readonly now: () => Date;
    private readonly randomId: () => string;

    constructor(options: RecordCommitAPIOptions = {}) {
        this.storage = options.storage ?? new JsonFileStorage();
        this.history = options.history ?? new HistoryService({
            rootDir: this.storage.rootDir,
        });
        this.hashService = options.hashService ?? new HashService();
        this.now = options.now ?? (() => new Date());
        this.randomId = options.randomId ?? (() => crypto.randomUUID());
    }

    /**
     * Official write path for any caller（CLI or future adapter）.
     * Not CLI-specific.
     */
    commit(input: RecordCommitInput): RecordCommitResult {
        const type = input.type?.trim();
        const title = input.title?.trim();
        if (!type) {
            throw new Error("type must be non-empty");
        }
        if (!title) {
            throw new Error("title must be non-empty");
        }

        const id = (input.id ?? this.randomId()).trim();
        if (!id) {
            throw new Error("id must be non-empty");
        }
        const createdAt = (input.createdAt ?? this.now().toISOString()).trim();
        if (!createdAt) {
            throw new Error("createdAt must be non-empty");
        }

        const payload = {
            id,
            type,
            createdAt,
            title,
            content: input.content ?? "",
            evidence: [...(input.evidence ?? [])],
            metadata: input.metadata,
            version: RUNTIME_RECORD_VERSION,
        };
        const hash = this.hashService.hashPayload(payload);
        const record = freezeRuntimeRecord({ ...payload, hash });

        const path = this.storage.save(record);
        try {
            this.history.appendRecordCreated({
                id: record.id,
                hash: record.hash,
                at: record.createdAt,
            });
        } catch (err) {
            // Do not delete storage artifact（P0: no silent erase / no fake rollback）.
            throw new RecordCommitPartialError({
                recordId: record.id,
                recordPath: path,
                cause: err,
            });
        }

        return Object.freeze({ record, path });
    }
}

export function createRecordCommitAPI(
    options?: RecordCommitAPIOptions
): RecordCommitAPI {
    return new RecordCommitAPI(options);
}
