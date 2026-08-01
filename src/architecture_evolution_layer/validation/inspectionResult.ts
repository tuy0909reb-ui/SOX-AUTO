/**
 * ASA-ARCH-46.0 — inspection result factory
 */

import type { EvolutionValidationInspectionResult } from "../interfaces";

export function freezeInspectionResult(input: {
    passed: boolean;
    findings?: readonly string[];
}): EvolutionValidationInspectionResult {
    return Object.freeze({
        inspectionKind: "EvolutionValidationInspectionResult",
        passed: input.passed,
        findings: Object.freeze([...(input.findings ?? [])]),
        isInspectionOnly: true,
        doesNotDecide: true,
        doesNotGrantAuthority: true,
        doesNotMutateRegistry: true,
    });
}

export function mergeInspectionResults(
    results: readonly EvolutionValidationInspectionResult[]
): EvolutionValidationInspectionResult {
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
