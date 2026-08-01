/**
 * ASA-ARCH-50.0 — BaselineReference
 */

import type {
    BaselineDigest,
    FreezeReference,
    RepositoryBaselineReference,
    VerificationReference,
} from "../types";

export interface BaselineReference {
    readonly kind: "BaselineReference";
    readonly foundationReference: "ASA-FOUNDATION-1.0";
    readonly freezeReferences: readonly FreezeReference[];
    readonly verificationReferences: readonly VerificationReference[];
    readonly repositoryBaselineReferences: readonly RepositoryBaselineReference[];
    readonly baselineDigest: BaselineDigest;
    readonly immutable: true;
}

export function freezeBaselineReference(input: {
    freezeReferences: readonly FreezeReference[];
    verificationReferences: readonly VerificationReference[];
    repositoryBaselineReferences: readonly RepositoryBaselineReference[];
    baselineDigest: BaselineDigest;
}): BaselineReference {
    return Object.freeze({
        kind: "BaselineReference",
        foundationReference: "ASA-FOUNDATION-1.0",
        freezeReferences: Object.freeze([...input.freezeReferences]),
        verificationReferences: Object.freeze([
            ...input.verificationReferences,
        ]),
        repositoryBaselineReferences: Object.freeze([
            ...input.repositoryBaselineReferences,
        ]),
        baselineDigest: input.baselineDigest,
        immutable: true,
    });
}
