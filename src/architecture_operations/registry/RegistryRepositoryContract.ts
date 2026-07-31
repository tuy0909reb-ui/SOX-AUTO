/**
 * ASA-ARCH-44.0 — RegistryRepositoryContract
 * Storage boundary for append-only registry persistence.
 */

import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { LifecycleTransitionRecord } from "../events/LifecycleTransitionRecord";
import type { RegistryRecord } from "./RegistryRecord";

export interface RegistryRepositoryContract {
    readonly appendOnly: true;
    getCurrent(architecture: ArchitectureIdentity): RegistryRecord | undefined;
    getHistory(
        architecture: ArchitectureIdentity
    ): readonly LifecycleTransitionRecord[];
    append(
        current: RegistryRecord,
        transition: LifecycleTransitionRecord
    ): void;
}

export const REGISTRY_REPOSITORY_CAPABILITIES = Object.freeze({
    appendOnly: true,
    canOverwrite: false,
    canDecideTransitions: false,
    canCreateApprovals: false,
});
