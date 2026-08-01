export interface RecommendationInspectionResult {
    readonly inspectionKind: "RecommendationInspectionResult";
    readonly passed: boolean;
    readonly findings: readonly string[];
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
    readonly doesNotGrantAuthority: true;
}

export function freezeInspectionResult(input: {
    passed: boolean;
    findings?: readonly string[];
}): RecommendationInspectionResult {
    return Object.freeze({
        inspectionKind: "RecommendationInspectionResult",
        passed: input.passed,
        findings: Object.freeze([...(input.findings ?? [])]),
        isInspectionOnly: true,
        doesNotDecide: true,
        doesNotGrantAuthority: true,
    });
}

export function mergeInspectionResults(
    results: readonly RecommendationInspectionResult[]
): RecommendationInspectionResult {
    const findings: string[] = [];
    let passed = true;
    for (const r of results) {
        if (!r.passed) passed = false;
        findings.push(...r.findings);
    }
    return freezeInspectionResult({ passed, findings });
}
