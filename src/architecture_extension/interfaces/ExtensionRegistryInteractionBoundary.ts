/**
 * ASA-ARCH-45.0 — ExtensionRegistryInteractionBoundary
 * Composed registry interaction boundary. Reference storage / retrieval only.
 */

import type { ExtensionRegistryHistoryReader } from "./ExtensionRegistryHistoryReader";
import type { ExtensionRegistryReader } from "./ExtensionRegistryReader";
import type { ExtensionRegistryWriter } from "./ExtensionRegistryWriter";

export interface ExtensionRegistryInteractionBoundary {
    readonly interfaceId: "ExtensionRegistryInteractionBoundary";
    readonly storesReferencesOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;
    readonly doesNotApproveExtension: true;
    readonly doesNotExecuteExtension: true;

    readonly reader: ExtensionRegistryReader;
    readonly writer: ExtensionRegistryWriter;
    readonly historyReader: ExtensionRegistryHistoryReader;
}
