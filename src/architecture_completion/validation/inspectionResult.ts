export interface CompletionInspectionResult {
    readonly inspectionKind: "CompletionInspectionResult";
    readonly passed: boolean;
    readonly findings: readonly string[];
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
    readonly doesNotGrantAuthority: true;
}

export function freezeInspectionResult(input: {
    passed: boolean;
    findings?: readonly string[];
}): CompletionInspectionResult {
    return Object.freeze({
        inspectionKind: "CompletionInspectionResult",
        passed: input.passed,
        findings: Object.freeze([...(input.findings ?? [])]),
        isInspectionOnly: true,
        doesNotDecide: true,
        doesNotGrantAuthority: true,
    });
}

export function mergeInspectionResults(
    results: readonly CompletionInspectionResult[]
): CompletionInspectionResult {
    const findings: string[] = [];
    let passed = true;
    for (const r of results) {
        if (!r.passed) passed = false;
        findings.push(...r.findings);
    }
    return freezeInspectionResult({ passed, findings });
}
