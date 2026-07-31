/**
 * ASA-ARCH-45.0 — inspection result factory
 * Inspection outcomes are not authority decisions.
 */

import type { ExtensionValidationInspectionResult } from "../interfaces";

export function freezeInspectionResult(input: {
    passed: boolean;
    findings?: readonly string[];
}): ExtensionValidationInspectionResult {
    return Object.freeze({
        inspectionKind: "ExtensionValidationInspectionResult",
        passed: input.passed,
        findings: Object.freeze([...(input.findings ?? [])]),
        isInspectionOnly: true,
        doesNotDecide: true,
        doesNotGrantAuthority: true,
        doesNotMutateRegistry: true,
    });
}

export function mergeInspectionResults(
    results: readonly ExtensionValidationInspectionResult[]
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    let passed = true;
    for (const result of results) {
        if (!result.passed) {
            passed = false;
        }
        findings.push(...result.findings);
    }
    return freezeInspectionResult({ passed, findings });
}
