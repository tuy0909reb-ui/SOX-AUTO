/**
 * ASA-ARCH-45.0 — ApprovalReference
 * Immutable approval reference primitive (identity token only).
 * Does not grant authority, execute approval, or modify lifecycle.
 */

export type ApprovalReference = string & {
    readonly __brand: "ApprovalReference";
};

/** Sole allowed approval authority for Extension Boundary declarations. */
export type ApprovalAuthority = "HUMAN_ARCHITECT";

export const APPROVAL_AUTHORITY: ApprovalAuthority = "HUMAN_ARCHITECT";

export function createApprovalReference(value: string): ApprovalReference {
    const v = value.trim();
    if (!v) {
        throw new Error("ApprovalReference must be non-empty");
    }
    return Object.freeze(v) as ApprovalReference;
}
