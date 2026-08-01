export interface TraceabilityInspectionResult {
    readonly inspectionKind: "TraceabilityInspectionResult";
    readonly passed: boolean;
    readonly findings: readonly string[];
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
    readonly doesNotGrantAuthority: true;
}

export function freezeInspectionResult(input: {
    passed: boolean;
    findings?: readonly string[];
}): TraceabilityInspectionResult {
    return Object.freeze({
        inspectionKind: "TraceabilityInspectionResult",
        passed: input.passed,
        findings: Object.freeze([...(input.findings ?? [])]),
        isInspectionOnly: true,
        doesNotDecide: true,
        doesNotGrantAuthority: true,
    });
}

export function mergeInspectionResults(
    results: readonly TraceabilityInspectionResult[]
): TraceabilityInspectionResult {
    const findings: string[] = [];
    let passed = true;
    for (const r of results) {
        if (!r.passed) passed = false;
        findings.push(...r.findings);
    }
    return freezeInspectionResult({ passed, findings });
}
