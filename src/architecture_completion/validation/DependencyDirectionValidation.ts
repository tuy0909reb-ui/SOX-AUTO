import { ARCHITECTURE_EXTENSION_LAYER } from "../../architecture_extension";
import { ARCHITECTURE_EVOLUTION_LAYER } from "../../architecture_evolution_layer";
import { ARCHITECTURE_INTELLIGENCE_LAYER } from "../../architecture_intelligence";
import { ARCHITECTURE_TRACEABILITY_LAYER } from "../../architecture_traceability";
import { ARCHITECTURE_RECOMMENDATION_LAYER } from "../../architecture_recommendation";
import { freezeCompletionDependencyBoundaryContract } from "../contracts";
import {
    freezeInspectionResult,
    type CompletionInspectionResult,
} from "./inspectionResult";

export function inspectDependencyDirection(): CompletionInspectionResult {
    const contract = freezeCompletionDependencyBoundaryContract();
    const findings: string[] = [];

    if (ARCHITECTURE_EXTENSION_LAYER.architectureId !== "ASA-ARCH-45.0") {
        findings.push("published extension layer identity mismatch");
    }
    if (ARCHITECTURE_EVOLUTION_LAYER.architectureId !== "ASA-ARCH-46.0") {
        findings.push("published evolution layer identity mismatch");
    }
    if (ARCHITECTURE_INTELLIGENCE_LAYER.architectureId !== "ASA-ARCH-47.0") {
        findings.push("published intelligence layer identity mismatch");
    }
    if (ARCHITECTURE_TRACEABILITY_LAYER.architectureId !== "ASA-ARCH-48.0") {
        findings.push("published traceability layer identity mismatch");
    }
    if (ARCHITECTURE_RECOMMENDATION_LAYER.architectureId !== "ASA-ARCH-49.0") {
        findings.push("published recommendation layer identity mismatch");
    }
    if (contract.dependsOnRecommendationLayer !== "ASA-ARCH-49.0") {
        findings.push("dependsOnRecommendationLayer mismatch");
    }
    if (!contract.consumesPublishedContractsOnly) {
        findings.push("must consume published contracts only");
    }
    if (!contract.forbidsFrozenArchitectureModification) {
        findings.push("must forbid frozen architecture modification");
    }

    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
