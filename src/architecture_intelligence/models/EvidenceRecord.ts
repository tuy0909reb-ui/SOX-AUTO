/**
 * ASA-ARCH-47.0 — EvidenceRecord
 */

import type { EvidenceIdentity } from "../types";

export interface EvidenceRecord {
    readonly kind: "EvidenceRecord";
    readonly evidenceId: EvidenceIdentity;
    readonly source: string;
    readonly analysis: string;
    readonly result: string;
    readonly trace: readonly string[];
    readonly immutable: true;
    readonly maintainsAccountability: true;
}

export function freezeEvidenceRecord(input: {
    evidenceId: EvidenceIdentity;
    source: string;
    analysis: string;
    result: string;
    trace: readonly string[];
}): EvidenceRecord {
    return Object.freeze({
        kind: "EvidenceRecord",
        evidenceId: input.evidenceId,
        source: input.source.trim(),
        analysis: input.analysis.trim(),
        result: input.result.trim(),
        trace: Object.freeze([...input.trace]),
        immutable: true,
        maintainsAccountability: true,
    });
}
