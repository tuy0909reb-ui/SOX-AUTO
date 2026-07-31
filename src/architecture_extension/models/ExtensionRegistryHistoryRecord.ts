/**
 * ASA-ARCH-45.0 — ExtensionRegistryHistoryRecord
 * Immutable structural model for historical registry reference.
 * Historical data only — no lifecycle execution or authority.
 */

import type {
    ApprovalReference,
    ExtensionIdentifier,
    LifecycleDeclarationState,
} from "../types";

export interface ExtensionRegistryHistoryRecord {
    readonly modelKind: "ExtensionRegistryHistoryRecord";
    readonly extensionId: ExtensionIdentifier;
    readonly previousDeclarationState: LifecycleDeclarationState;
    readonly nextDeclarationState: LifecycleDeclarationState;
    readonly supersessionApprovalReference: ApprovalReference | null;
    readonly historicalTransitionReference: string;
    readonly doesNotActivateExtension: true;
    readonly doesNotExecuteExtension: true;
    readonly immutable: true;
}

export function freezeExtensionRegistryHistoryRecord(input: {
    extensionId: ExtensionIdentifier;
    previousDeclarationState: LifecycleDeclarationState;
    nextDeclarationState: LifecycleDeclarationState;
    supersessionApprovalReference: ApprovalReference | null;
    historicalTransitionReference: string;
}): ExtensionRegistryHistoryRecord {
    const historicalTransitionReference =
        input.historicalTransitionReference.trim();
    if (!historicalTransitionReference) {
        throw new Error("historicalTransitionReference must be non-empty");
    }
    return Object.freeze({
        modelKind: "ExtensionRegistryHistoryRecord",
        extensionId: input.extensionId,
        previousDeclarationState: input.previousDeclarationState,
        nextDeclarationState: input.nextDeclarationState,
        supersessionApprovalReference: input.supersessionApprovalReference,
        historicalTransitionReference,
        doesNotActivateExtension: true,
        doesNotExecuteExtension: true,
        immutable: true,
    });
}
