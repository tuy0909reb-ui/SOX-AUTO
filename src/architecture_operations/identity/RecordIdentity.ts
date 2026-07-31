/**
 * ASA-ARCH-44.0 — RecordIdentity
 * Immutable identity for a registry record.
 */

export type RecordIdentity = string & {
    readonly __brand: "RecordIdentity";
};

export function createRecordIdentity(value: string): RecordIdentity {
    const v = value.trim();
    if (!v) {
        throw new Error("RecordIdentity must be non-empty");
    }
    return Object.freeze(v) as RecordIdentity;
}
