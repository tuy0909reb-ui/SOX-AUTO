/**
 * ASA-ARCH-44.0 — RegistryHistory
 * Append-only history view over lifecycle transition records.
 */

import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { LifecycleTransitionRecord } from "../events/LifecycleTransitionRecord";

export interface RegistryHistory {
    readonly architecture: ArchitectureIdentity;
    readonly records: readonly LifecycleTransitionRecord[];
    readonly appendOnly: true;
}

export function freezeRegistryHistory(
    architecture: ArchitectureIdentity,
    records: readonly LifecycleTransitionRecord[]
): RegistryHistory {
    return Object.freeze({
        architecture,
        records: Object.freeze([...records]),
        appendOnly: true,
    });
}
