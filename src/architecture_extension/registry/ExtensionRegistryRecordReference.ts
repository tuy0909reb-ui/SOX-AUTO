/**
 * ASA-ARCH-45.0 — ExtensionRegistryRecordReference
 * Registry-side immutable handle around a stored ExtensionRegistryRecord.
 */

import type { ExtensionRegistryRecord } from "../models";

export interface ExtensionRegistryRecordReference {
    readonly referenceKind: "ExtensionRegistryRecordReference";
    readonly record: ExtensionRegistryRecord;
    readonly registryIntegrityReference: string;
    readonly storesReferencesOnly: true;
    readonly doesNotActivateExtension: true;
    readonly doesNotExecuteExtension: true;
    readonly doesNotApproveExtension: true;
    readonly immutable: true;
}

export function freezeExtensionRegistryRecordReference(input: {
    record: ExtensionRegistryRecord;
    registryIntegrityReference?: string;
}): ExtensionRegistryRecordReference {
    if (!input.record.immutable) {
        throw new Error("ExtensionRegistryRecord must be immutable");
    }
    const registryIntegrityReference = (
        input.registryIntegrityReference ?? input.record.integrityReference
    ).trim();
    if (!registryIntegrityReference) {
        throw new Error("registryIntegrityReference must be non-empty");
    }
    return Object.freeze({
        referenceKind: "ExtensionRegistryRecordReference",
        record: input.record,
        registryIntegrityReference,
        storesReferencesOnly: true,
        doesNotActivateExtension: true,
        doesNotExecuteExtension: true,
        doesNotApproveExtension: true,
        immutable: true,
    });
}
