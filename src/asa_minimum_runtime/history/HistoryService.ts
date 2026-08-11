/**
 * ASA Minimum Runtime v0.1 — HistoryService
 * Phase 3: append-only history.jsonl under data/asa_minimum_runtime/history/
 */

import * as fs from "fs";
import * as path from "path";
import { DEFAULT_RUNTIME_DATA_ROOT } from "../storage";

export type HistoryEventType = "RECORD_CREATED";

export interface HistoryEvent {
    readonly event: HistoryEventType;
    readonly id: string;
    readonly hash: string;
    readonly at: string;
}

export interface HistoryServiceOptions {
    readonly rootDir?: string;
}

export class HistoryService {
    readonly rootDir: string;
    readonly historyDir: string;
    readonly historyFile: string;

    constructor(options: HistoryServiceOptions = {}) {
        this.rootDir = path.resolve(
            options.rootDir ?? DEFAULT_RUNTIME_DATA_ROOT
        );
        this.historyDir = path.join(this.rootDir, "history");
        this.historyFile = path.join(this.historyDir, "history.jsonl");
    }

    ensureLayout(): void {
        fs.mkdirSync(this.historyDir, { recursive: true });
        if (!fs.existsSync(this.historyFile)) {
            fs.writeFileSync(this.historyFile, "", { encoding: "utf8" });
        }
    }

    /**
     * Append-only. Never rewrites prior history lines.
     */
    append(event: HistoryEvent): void {
        if (event.event !== "RECORD_CREATED") {
            throw new Error(`unsupported history event: ${String(event.event)}`);
        }
        if (!event.id.trim() || !event.hash.trim() || !event.at.trim()) {
            throw new Error("history event fields must be non-empty");
        }
        this.ensureLayout();
        const line = `${JSON.stringify({
            event: event.event,
            id: event.id.trim(),
            hash: event.hash.trim(),
            at: event.at.trim(),
        })}\n`;
        fs.appendFileSync(this.historyFile, line, { encoding: "utf8" });
    }

    appendRecordCreated(input: {
        id: string;
        hash: string;
        at: string;
    }): void {
        this.append({
            event: "RECORD_CREATED",
            id: input.id,
            hash: input.hash,
            at: input.at,
        });
    }

    /**
     * Retrieval in append order（oldest first）— deterministic.
     */
    list(limit?: number): HistoryEvent[] {
        this.ensureLayout();
        const text = fs.readFileSync(this.historyFile, "utf8");
        const events: HistoryEvent[] = [];
        for (const rawLine of text.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line) continue;
            let parsed: unknown;
            try {
                parsed = JSON.parse(line);
            } catch {
                throw new Error("corrupt history.jsonl line");
            }
            if (!parsed || typeof parsed !== "object") {
                throw new Error("invalid history event object");
            }
            const obj = parsed as Record<string, unknown>;
            events.push(
                Object.freeze({
                    event: "RECORD_CREATED",
                    id: String(obj.id ?? ""),
                    hash: String(obj.hash ?? ""),
                    at: String(obj.at ?? ""),
                })
            );
        }
        if (limit === undefined) {
            return events;
        }
        if (!Number.isFinite(limit) || limit < 0) {
            throw new Error("limit must be a non-negative number");
        }
        return events.slice(0, limit);
    }
}

export function createHistoryService(
    options?: HistoryServiceOptions
): HistoryService {
    return new HistoryService(options);
}
