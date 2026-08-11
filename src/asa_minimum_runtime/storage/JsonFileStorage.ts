/**
 * ASA Minimum Runtime v0.1 / v0.1.1 — JsonFileStorage
 * JSON file persistence under data/asa_minimum_runtime/records/
 *
 * Append-oriented: create fails if record already exists（no silent replace）.
 * v0.1.1: optional metadata persistence（absent on disk ⇒ empty metadata）
 */

import * as fs from "fs";
import * as path from "path";
import {
    RUNTIME_RECORD_VERSION,
    freezeRuntimeRecord,
    hasMeaningfulMetadata,
    normalizeMetadata,
    type RuntimeRecord,
    type RuntimeRecordMetadata,
} from "../models";

export const DEFAULT_RUNTIME_DATA_ROOT = path.join(
    "data",
    "asa_minimum_runtime"
);

export interface JsonFileStorageOptions {
    /** Absolute or process-cwd-relative root. Default: data/asa_minimum_runtime */
    readonly rootDir?: string;
}

function parseMetadata(raw: unknown): Partial<RuntimeRecordMetadata> | undefined {
    if (!raw || typeof raw !== "object") return undefined;
    const obj = raw as Record<string, unknown>;
    return {
        tags: Array.isArray(obj.tags) ? obj.tags.map((t) => String(t)) : [],
        relatedRecords: Array.isArray(obj.relatedRecords)
            ? obj.relatedRecords.map((r) => String(r))
            : [],
        source: String(obj.source ?? ""),
    };
}

export class JsonFileStorage {
    readonly rootDir: string;
    readonly recordsDir: string;

    constructor(options: JsonFileStorageOptions = {}) {
        this.rootDir = path.resolve(
            options.rootDir ?? DEFAULT_RUNTIME_DATA_ROOT
        );
        this.recordsDir = path.join(this.rootDir, "records");
    }

    ensureLayout(): void {
        fs.mkdirSync(this.recordsDir, { recursive: true });
    }

    recordPath(id: string): string {
        const safeId = id.trim();
        if (!safeId) {
            throw new Error("record id must be non-empty");
        }
        if (
            safeId.includes("/") ||
            safeId.includes("\\") ||
            safeId.includes("..")
        ) {
            throw new Error("record id contains illegal path characters");
        }
        return path.join(this.recordsDir, `${safeId}.json`);
    }

    exists(id: string): boolean {
        return fs.existsSync(this.recordPath(id));
    }

    /**
     * Append-oriented create: writes records/<id>.json.
     * Fails if the file already exists.
     */
    save(record: RuntimeRecord): string {
        this.ensureLayout();
        const filePath = this.recordPath(record.id);
        if (fs.existsSync(filePath)) {
            throw new Error(
                `record already exists（no silent replace）: ${record.id}`
            );
        }

        const serializable: Record<string, unknown> = {
            id: record.id,
            type: record.type,
            createdAt: record.createdAt,
            title: record.title,
            content: record.content,
            evidence: [...record.evidence],
            hash: record.hash,
            version: record.version,
        };

        if (hasMeaningfulMetadata(record.metadata)) {
            serializable.metadata = {
                tags: [...record.metadata.tags],
                relatedRecords: [...record.metadata.relatedRecords],
                source: record.metadata.source,
            };
        }

        const json = `${JSON.stringify(serializable, null, 2)}\n`;
        fs.writeFileSync(filePath, json, { encoding: "utf8", flag: "wx" });
        return filePath;
    }

    load(id: string): RuntimeRecord {
        const filePath = this.recordPath(id);
        if (!fs.existsSync(filePath)) {
            throw new Error(`record not found: ${id}`);
        }
        const raw = fs.readFileSync(filePath, "utf8");
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new Error(`invalid JSON for record: ${id}`);
        }
        if (!parsed || typeof parsed !== "object") {
            throw new Error(`invalid record object: ${id}`);
        }
        const obj = parsed as Record<string, unknown>;
        return freezeRuntimeRecord({
            id: String(obj.id ?? ""),
            type: String(obj.type ?? ""),
            createdAt: String(obj.createdAt ?? ""),
            title: String(obj.title ?? ""),
            content: String(obj.content ?? ""),
            evidence: Array.isArray(obj.evidence)
                ? obj.evidence.map((e) => String(e))
                : [],
            metadata: normalizeMetadata(parseMetadata(obj.metadata)),
            hash: String(obj.hash ?? ""),
            version:
                obj.version === RUNTIME_RECORD_VERSION
                    ? RUNTIME_RECORD_VERSION
                    : RUNTIME_RECORD_VERSION,
        });
    }

    listIds(): string[] {
        this.ensureLayout();
        return fs
            .readdirSync(this.recordsDir)
            .filter((name) => name.endsWith(".json"))
            .map((name) => name.slice(0, -".json".length))
            .sort();
    }
}

export function createJsonFileStorage(
    options?: JsonFileStorageOptions
): JsonFileStorage {
    return new JsonFileStorage(options);
}
