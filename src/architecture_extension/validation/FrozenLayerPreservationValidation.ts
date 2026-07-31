/**
 * ASA-ARCH-45.0 — FrozenLayerPreservationValidation
 * Read-only comparison of provided frozen-layer digest evidence.
 * Does not import or modify Ch35/42/43/44 packages.
 */

import type { ExtensionValidationInspectionResult } from "../interfaces";
import { freezeInspectionResult } from "./inspectionResult";

export type FrozenLayerId = "Ch35" | "Ch42" | "Ch43" | "Ch44";

export interface FrozenLayerDigestEvidence {
    readonly layer: FrozenLayerId;
    readonly artifactPath: string;
    readonly expectedSha256: string;
    readonly actualSha256: string;
}

export function validateFrozenLayerPreservation(
    evidence: readonly FrozenLayerDigestEvidence[]
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    const required: readonly FrozenLayerId[] = Object.freeze([
        "Ch35",
        "Ch42",
        "Ch43",
        "Ch44",
    ]);
    const seen = new Set<FrozenLayerId>();

    for (const item of evidence) {
        seen.add(item.layer);
        if (!item.expectedSha256 || !item.actualSha256) {
            findings.push(
                `${item.layer} digest evidence incomplete for ${item.artifactPath}`
            );
            continue;
        }
        if (item.expectedSha256 !== item.actualSha256) {
            findings.push(
                `${item.layer} digest drift: ${item.artifactPath}`
            );
        }
    }

    for (const layer of required) {
        if (![...seen].includes(layer)) {
            // Evidence may be partial per call; absence is reported only when
            // caller requested a full set via validateAllFrozenLayersPresent.
        }
    }

    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateAllFrozenLayersPresent(
    evidence: readonly FrozenLayerDigestEvidence[]
): ExtensionValidationInspectionResult {
    const required: readonly FrozenLayerId[] = [
        "Ch35",
        "Ch42",
        "Ch43",
        "Ch44",
    ];
    const findings: string[] = [];
    for (const layer of required) {
        if (!evidence.some((e) => e.layer === layer)) {
            findings.push(`Missing preservation evidence for ${layer}`);
        }
    }
    const digestResult = validateFrozenLayerPreservation(evidence);
    findings.push(...digestResult.findings);
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
