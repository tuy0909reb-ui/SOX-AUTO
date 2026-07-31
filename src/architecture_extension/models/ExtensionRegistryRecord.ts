/**
 * ASA-ARCH-45.0 — ExtensionRegistryRecord
 * Immutable structural model for a registry reference record.
 * Storage authority belongs to registry layer — this model is data only.
 */

import type { ExtensionIdentifier, LifecycleDeclarationState } from "../types";

export interface ExtensionRegistryRecord {
    readonly modelKind: "ExtensionRegistryRecord";
    readonly extensionId: ExtensionIdentifier;
    readonly versionReference: string;
    readonly declarationState: LifecycleDeclarationState;
    readonly contractReference: string;
    readonly approvalReference: string;
    readonly integrityReference: string;
    readonly doesNotActivateExtension: true;
    readonly doesNotExecuteExtension: true;
    readonly doesNotApproveExtension: true;
    readonly immutable: true;
}

export function freezeExtensionRegistryRecord(input: {
    extensionId: ExtensionIdentifier;
    versionReference: string;
    declarationState: LifecycleDeclarationState;
    contractReference: string;
    approvalReference: string;
    integrityReference: string;
}): ExtensionRegistryRecord {
    const versionReference = input.versionReference.trim();
    const contractReference = input.contractReference.trim();
    const approvalReference = input.approvalReference.trim();
    const integrityReference = input.integrityReference.trim();
    if (!versionReference || !contractReference || !approvalReference || !integrityReference) {
        throw new Error("ExtensionRegistryRecord references must be non-empty");
    }
    return Object.freeze({
        modelKind: "ExtensionRegistryRecord",
        extensionId: input.extensionId,
        versionReference,
        declarationState: input.declarationState,
        contractReference,
        approvalReference,
        integrityReference,
        doesNotActivateExtension: true,
        doesNotExecuteExtension: true,
        doesNotApproveExtension: true,
        immutable: true,
    });
}
