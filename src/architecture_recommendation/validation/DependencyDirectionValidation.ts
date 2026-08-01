import { ARCHITECTURE_INTELLIGENCE_LAYER } from "../../architecture_intelligence";
import { ARCHITECTURE_TRACEABILITY_LAYER } from "../../architecture_traceability";
import {
    freezeRecommendationDependencyBoundaryContract,
} from "../contracts";
import { freezeInspectionResult, type RecommendationInspectionResult } from "./inspectionResult";

export function inspectDependencyDirection(): RecommendationInspectionResult {
    const contract = freezeRecommendationDependencyBoundaryContract();
    const findings: string[] = [];

    if (contract.dependsOnIntelligenceLayer !== "ASA-ARCH-47.0") {
        findings.push("dependsOnIntelligenceLayer mismatch");
    }
    if (contract.dependsOnTraceabilityLayer !== "ASA-ARCH-48.0") {
        findings.push("dependsOnTraceabilityLayer mismatch");
    }
    if (ARCHITECTURE_INTELLIGENCE_LAYER.architectureId !== "ASA-ARCH-47.0") {
        findings.push("published intelligence layer identity mismatch");
    }
    if (ARCHITECTURE_TRACEABILITY_LAYER.architectureId !== "ASA-ARCH-48.0") {
        findings.push("published traceability layer identity mismatch");
    }
    if (!contract.consumesPublishedContractsOnly) {
        findings.push("must consume published contracts only");
    }
    if (!contract.forbidsRuntimeDependency) {
        findings.push("must forbid runtime dependency");
    }

    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
