/**
 * ASA-ARCH-44.0 — RegistryRecord
 * Immutable current projection reference for an architecture declaration.
 */

import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { DeclarationIdentity } from "../identity/DeclarationIdentity";
import type { RecordIdentity } from "../identity/RecordIdentity";
import type { ArchitectureLifecycleState } from "../lifecycle/LifecycleState";

export interface RegistryRecord {
    readonly recordId: RecordIdentity;
    readonly declarationId: DeclarationIdentity;
    readonly architecture: ArchitectureIdentity;
    readonly status: ArchitectureLifecycleState;
    readonly version: string;
    readonly lastTransitionId: string | null;
    readonly integrityReference: string | null;
    readonly immutable: true;
}

export function freezeRegistryRecord(
    record: Omit<RegistryRecord, "immutable">
): RegistryRecord {
    return Object.freeze({ ...record, immutable: true });
}
