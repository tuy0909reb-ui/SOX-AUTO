/**
 * ASA-ARCH-47.0 — inspection result factory
 */

export interface IntelligenceInspectionResult {
    readonly inspectionKind: "IntelligenceInspectionResult";
    readonly passed: boolean;
    readonly findings: readonly string[];
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
    readonly doesNotGrantAuthority: true;
}

export function freezeInspectionResult(input: {
    passed: boolean;
    findings?: readonly string[];
}): IntelligenceInspectionResult {
    return Object.freeze({
        inspectionKind: "IntelligenceInspectionResult",
        passed: input.passed,
        findings: Object.freeze([...(input.findings ?? [])]),
        isInspectionOnly: true,
        doesNotDecide: true,
        doesNotGrantAuthority: true,
    });
}

export function mergeInspectionResults(
    results: readonly IntelligenceInspectionResult[]
): IntelligenceInspectionResult {
    const findings: string[] = [];
    let passed = true;
    for (const result of results) {
        if (!result.passed) passed = false;
        findings.push(...result.findings);
    }
    return freezeInspectionResult({ passed, findings });
}
