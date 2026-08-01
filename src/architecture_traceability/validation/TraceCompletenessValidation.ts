import {
    freezeTraceCompletenessContract,
    type TraceCompletenessContract,
} from "../contracts";
import type { TraceRegistry } from "../registry";
import {
    freezeInspectionResult,
    type TraceabilityInspectionResult,
} from "./inspectionResult";

export function inspectTraceCompleteness(
    registry: TraceRegistry,
    sourceArtifact: string,
    contract: TraceCompletenessContract = freezeTraceCompletenessContract()
): TraceabilityInspectionResult {
    const findings: string[] = [];
    const records = registry
        .list()
        .filter((r) => String(r.sourceArtifact) === sourceArtifact);
    if (records.length === 0) {
        findings.push(`no trace records for source: ${sourceArtifact}`);
    }
    for (const r of records) {
        if (!String(r.evidenceReference).trim()) {
            findings.push(`missing evidence: ${r.traceId}`);
        }
        if (!String(r.digestReference).trim()) {
            findings.push(`missing digest: ${r.traceId}`);
        }
        if (!r.immutableStatus || !r.immutable) {
            findings.push(`not immutable: ${r.traceId}`);
        }
    }
    if (!contract.requiresLifecycleChainVisibility) {
        findings.push("requiresLifecycleChainVisibility must be true");
    }
    if (contract.requiredStages.length < 10) {
        findings.push("requiredStages incomplete");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
