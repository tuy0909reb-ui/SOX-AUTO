/**
 * ASA-ARCH-48.0 — LifecycleStatus（declaration only）
 */

export enum LifecycleStatus {
    INTENT = "INTENT",
    DESIGNED = "DESIGNED",
    CONTRACTED = "CONTRACTED",
    REGISTERED = "REGISTERED",
    AUTHORIZED = "AUTHORIZED",
    IMPLEMENTED = "IMPLEMENTED",
    VERIFIED = "VERIFIED",
    EVIDENCE_REGISTERED = "EVIDENCE_REGISTERED",
    FROZEN = "FROZEN",
    ANCHORED = "ANCHORED",
}

export const LIFECYCLE_STATUSES: readonly LifecycleStatus[] = Object.freeze([
    LifecycleStatus.INTENT,
    LifecycleStatus.DESIGNED,
    LifecycleStatus.CONTRACTED,
    LifecycleStatus.REGISTERED,
    LifecycleStatus.AUTHORIZED,
    LifecycleStatus.IMPLEMENTED,
    LifecycleStatus.VERIFIED,
    LifecycleStatus.EVIDENCE_REGISTERED,
    LifecycleStatus.FROZEN,
    LifecycleStatus.ANCHORED,
]);

export function isLifecycleStatus(value: string): value is LifecycleStatus {
    return (LIFECYCLE_STATUSES as readonly string[]).includes(value);
}
