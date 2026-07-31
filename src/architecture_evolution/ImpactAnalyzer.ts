/**
 * ASA-ARCH-42.0 - Impact Analyzer Module (Draft 0.6)
 *
 * Dependency impact analysis from contract differences.
 * ImpactReport ≠ Approval / Execution.
 */

import type { ContractDifferenceAnalysis } from "./ContractAnalyzer";
import {
    freezeImpactReport,
    type ImpactReport,
} from "./ImpactReport";
import type { ImpactSeverity } from "./ArchitectureEvolutionTypes";

export interface DependencyGraph {
    readonly nodes: ReadonlyArray<string>;
    readonly edges: ReadonlyArray<{
        readonly from: string;
        readonly to: string;
    }>;
}

export interface ImpactAnalyzerRole {
    readonly roleId: "IMPACT_ANALYZER";
    readonly producesImpactReport: true;
    readonly forbidsApprove: true;
}

export function freezeImpactAnalyzerRole(): ImpactAnalyzerRole {
    return Object.freeze({
        roleId: "IMPACT_ANALYZER" as const,
        producesImpactReport: true as const,
        forbidsApprove: true as const,
    });
}

function collectUpstream(
    component: string,
    graph: DependencyGraph
): string[] {
    return graph.edges
        .filter((e) => e.to === component)
        .map((e) => e.from)
        .sort();
}

function collectDownstream(
    component: string,
    graph: DependencyGraph
): string[] {
    return graph.edges
        .filter((e) => e.from === component)
        .map((e) => e.to)
        .sort();
}

export function createImpactReport(input: {
    readonly changed_component: string;
    readonly difference: ContractDifferenceAnalysis;
    readonly dependencyGraph: DependencyGraph;
    readonly extensionIds?: ReadonlyArray<string>;
}): ImpactReport {
    const upstream = collectUpstream(
        input.changed_component,
        input.dependencyGraph
    );
    const downstream = collectDownstream(
        input.changed_component,
        input.dependencyGraph
    );
    const affectedContracts = [
        ...input.difference.addedKeys,
        ...input.difference.removedKeys,
        ...input.difference.changedKeys,
    ];
    const breaking =
        input.difference.touchesCore ||
        input.difference.touchesFrozen ||
        input.difference.removedKeys.length > 0;
    const severity: ImpactSeverity = input.difference.touchesCore
        ? "CRITICAL"
        : breaking
          ? "HIGH"
          : affectedContracts.length > 0
            ? "MEDIUM"
            : "LOW";
    const compatibility_result =
        breaking || input.difference.touchesCore ? "FAIL" : "PASS";

    return freezeImpactReport({
        changed_component: input.changed_component,
        upstream_dependencies: upstream,
        downstream_dependencies: downstream,
        affected_extensions: [...(input.extensionIds ?? [])],
        affected_contracts: affectedContracts,
        compatibility_result,
        breaking_change: breaking,
        migration_required: breaking,
        severity,
        freeze_requirement: severity === "HIGH" || severity === "CRITICAL",
    });
}
