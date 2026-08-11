/**
 * ASA Minimum Runtime — VerifyService
 * Existence + hash integrity + optional History membership（Write Discipline）.
 * Inspection only — does not repair, delete, or promote orphans.
 */

import { HashService } from "../hash";
import { HistoryService, type HistoryEvent } from "../history";
import { JsonFileStorage } from "../storage";

export interface VerifyFinding {
    readonly code: string;
    readonly message: string;
}

export interface VerifyResult {
    readonly passed: boolean;
    readonly checkedIds: readonly string[];
    readonly findings: readonly VerifyFinding[];
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
}

function freezeResult(input: {
    passed: boolean;
    checkedIds: readonly string[];
    findings: readonly VerifyFinding[];
}): VerifyResult {
    return Object.freeze({
        passed: input.passed,
        checkedIds: Object.freeze([...input.checkedIds]),
        findings: Object.freeze(
            input.findings.map((f) =>
                Object.freeze({ code: f.code, message: f.message })
            )
        ),
        isInspectionOnly: true,
        doesNotDecide: true,
    });
}

function indexRecordCreated(
    history: HistoryService
): Map<string, HistoryEvent> {
    const map = new Map<string, HistoryEvent>();
    for (const event of history.list()) {
        if (event.event !== "RECORD_CREATED") continue;
        if (!event.id.trim()) continue;
        // Last append wins if duplicates ever appear.
        map.set(event.id, event);
    }
    return map;
}

export class VerifyService {
    private readonly storage: JsonFileStorage;
    private readonly hashService: HashService;
    private readonly history: HistoryService | undefined;

    constructor(input?: {
        storage?: JsonFileStorage;
        hashService?: HashService;
        /** When provided, History membership / hash consistency are inspected. */
        history?: HistoryService;
    }) {
        this.storage = input?.storage ?? new JsonFileStorage();
        this.hashService = input?.hashService ?? new HashService();
        this.history = input?.history;
    }

    verifyRecord(id: string): VerifyResult {
        const findings: VerifyFinding[] = [];
        const historyIndex = this.history
            ? indexRecordCreated(this.history)
            : undefined;
        const inStorage = this.storage.exists(id);
        const historyEvent = historyIndex?.get(id);

        if (!inStorage) {
            if (historyEvent) {
                findings.push({
                    code: "RECORD_FILE_MISSING",
                    message: `history has RECORD_CREATED but storage file missing: ${id}`,
                });
            } else {
                findings.push({
                    code: "RECORD_MISSING",
                    message: `record not found: ${id}`,
                });
            }
            return freezeResult({
                passed: false,
                checkedIds: [id],
                findings,
            });
        }

        let record;
        try {
            record = this.storage.load(id);
        } catch (err) {
            findings.push({
                code: "RECORD_LOAD_FAILED",
                message: err instanceof Error ? err.message : String(err),
            });
            return freezeResult({
                passed: false,
                checkedIds: [id],
                findings,
            });
        }

        if (!this.hashService.verifyRecordHash(record)) {
            findings.push({
                code: "HASH_MISMATCH",
                message: `hash integrity failed: ${id}`,
            });
        }

        if (historyIndex) {
            if (!historyEvent) {
                findings.push({
                    code: "HISTORY_MISSING",
                    message: `storage record has no RECORD_CREATED history event: ${id}`,
                });
            } else if (historyEvent.hash !== record.hash) {
                findings.push({
                    code: "HISTORY_HASH_MISMATCH",
                    message: `history hash does not match storage hash: ${id}`,
                });
            }
        }

        return freezeResult({
            passed: findings.length === 0,
            checkedIds: [id],
            findings,
        });
    }

    verifyAll(): VerifyResult {
        const storageIds = this.storage.listIds();
        const findings: VerifyFinding[] = [];
        const checked: string[] = [];

        for (const id of storageIds) {
            const result = this.verifyRecord(id);
            checked.push(id);
            findings.push(...result.findings);
        }

        if (this.history) {
            const historyIndex = indexRecordCreated(this.history);
            for (const id of historyIndex.keys()) {
                if (storageIds.includes(id)) continue;
                checked.push(id);
                findings.push({
                    code: "RECORD_FILE_MISSING",
                    message: `history has RECORD_CREATED but storage file missing: ${id}`,
                });
            }
        }

        return freezeResult({
            passed: findings.length === 0,
            checkedIds: checked,
            findings,
        });
    }
}

export function createVerifyService(input?: {
    storage?: JsonFileStorage;
    hashService?: HashService;
    history?: HistoryService;
}): VerifyService {
    return new VerifyService(input);
}
