/**
 * ASA-ARCH-45.0 — Boundary-safe primitive types
 * Immutable branded string representations for Extension Boundary declarations.
 * Declarative only — no runtime / decision / authority semantics.
 */

export type ExtensionName = string & {
    readonly __brand: "ExtensionName";
};

export type ExtensionVersionReference = string & {
    readonly __brand: "ExtensionVersionReference";
};

export type IdentityHashReference = string & {
    readonly __brand: "IdentityHashReference";
};

export type ApprovedObjectReference = string & {
    readonly __brand: "ApprovedObjectReference";
};

export type ApprovedVersionReference = string & {
    readonly __brand: "ApprovedVersionReference";
};

export type ApprovalTimestampReference = string & {
    readonly __brand: "ApprovalTimestampReference";
};

export type ContractVersionReference = string & {
    readonly __brand: "ContractVersionReference";
};

export type CompatibleBoundaryReference = string & {
    readonly __brand: "CompatibleBoundaryReference";
};

function freezeNonEmpty(label: string, value: string): string {
    const v = value.trim();
    if (!v) {
        throw new Error(`${label} must be non-empty`);
    }
    return Object.freeze(v) as string;
}

export function createExtensionName(value: string): ExtensionName {
    return freezeNonEmpty("ExtensionName", value) as ExtensionName;
}

export function createExtensionVersionReference(
    value: string
): ExtensionVersionReference {
    return freezeNonEmpty(
        "ExtensionVersionReference",
        value
    ) as ExtensionVersionReference;
}

export function createIdentityHashReference(
    value: string
): IdentityHashReference {
    return freezeNonEmpty(
        "IdentityHashReference",
        value
    ) as IdentityHashReference;
}

export function createApprovedObjectReference(
    value: string
): ApprovedObjectReference {
    return freezeNonEmpty(
        "ApprovedObjectReference",
        value
    ) as ApprovedObjectReference;
}

export function createApprovedVersionReference(
    value: string
): ApprovedVersionReference {
    return freezeNonEmpty(
        "ApprovedVersionReference",
        value
    ) as ApprovedVersionReference;
}

export function createApprovalTimestampReference(
    value: string
): ApprovalTimestampReference {
    return freezeNonEmpty(
        "ApprovalTimestampReference",
        value
    ) as ApprovalTimestampReference;
}

export function createContractVersionReference(
    value: string
): ContractVersionReference {
    return freezeNonEmpty(
        "ContractVersionReference",
        value
    ) as ContractVersionReference;
}

export function createCompatibleBoundaryReference(
    value: string
): CompatibleBoundaryReference {
    return freezeNonEmpty(
        "CompatibleBoundaryReference",
        value
    ) as CompatibleBoundaryReference;
}
