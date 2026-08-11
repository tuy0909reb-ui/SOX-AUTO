/**
 * ASA Minimum Runtime v0.1 — HashService
 * Phase 1: SHA-256 over canonical record payload（excludes hash field）.
 */

import * as crypto from "crypto";
import {
    toCanonicalJson,
    toHashPayload,
    type RuntimeRecord,
    type RuntimeRecordHashPayload,
} from "../models";

export class HashService {
    readonly algorithm = "sha256" as const;

    hashPayload(payload: RuntimeRecordHashPayload): string {
        const canonical = toCanonicalJson(payload);
        return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
    }

    hashRecord(record: RuntimeRecord | RuntimeRecordHashPayload): string {
        return this.hashPayload(toHashPayload(record));
    }

    /** True when stored hash matches recomputed digest. */
    verifyRecordHash(record: RuntimeRecord): boolean {
        return record.hash === this.hashRecord(record);
    }
}

export function createHashService(): HashService {
    return new HashService();
}
