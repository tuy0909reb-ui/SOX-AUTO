/**
 * ASA-ARCH-44.0 — ValidationReference
 * Read-only reference to Ch43 published validation evidence.
 */

import type { ValidationReferenceKind } from "../contracts/ValidationReferenceContract";

export interface ValidationReference {
    readonly kind: ValidationReferenceKind;
    readonly artifactId: string;
    readonly sourceChapter: "ASA-ARCH-43.0";
    readonly readOnly: true;
    readonly cannotModifySource: true;
    readonly cannotRedirect: true;
    readonly cannotReplaceValidationAuthority: true;
}

export function createValidationReference(
    kind: ValidationReferenceKind,
    artifactId: string
): ValidationReference {
    const id = artifactId.trim();
    if (!id) {
        throw new Error("ValidationReference artifactId must be non-empty");
    }
    return Object.freeze({
        kind,
        artifactId: id,
        sourceChapter: "ASA-ARCH-43.0",
        readOnly: true,
        cannotModifySource: true,
        cannotRedirect: true,
        cannotReplaceValidationAuthority: true,
    });
}
