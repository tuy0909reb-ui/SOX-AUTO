/**
 * ASA-ARCH-42.0 - Contract Analyzer Module (Draft 0.6)
 *
 * Structural difference analysis between contract snapshots.
 * Analysis ≠ Mutation / Approval.
 */

import type { ContractSnapshot } from "./ContractSnapshot";

export interface ContractDifferenceAnalysis {
    readonly analysisId: string;
    readonly currentSnapshotId: string;
    readonly proposedSnapshotId: string;
    readonly addedKeys: ReadonlyArray<string>;
    readonly removedKeys: ReadonlyArray<string>;
    readonly changedKeys: ReadonlyArray<string>;
    readonly unchangedKeys: ReadonlyArray<string>;
    readonly touchesCore: boolean;
    readonly touchesFrozen: boolean;
    readonly analysisIsNotMutation: true;
}

export interface ContractAnalyzerRole {
    readonly roleId: "CONTRACT_ANALYZER";
    readonly analyzesDifference: true;
    readonly forbidsWriteArchitectureSource: true;
}

export function freezeContractAnalyzerRole(): ContractAnalyzerRole {
    return Object.freeze({
        roleId: "CONTRACT_ANALYZER" as const,
        analyzesDifference: true as const,
        forbidsWriteArchitectureSource: true as const,
    });
}

function payloadKeys(snapshot: ContractSnapshot): string[] {
    return Object.keys(snapshot.payload).sort();
}

export function analyzeContractDifference(input: {
    readonly analysisId: string;
    readonly current: ContractSnapshot;
    readonly proposed: ContractSnapshot;
    readonly coreContractIds?: ReadonlyArray<string>;
    readonly frozenContractIds?: ReadonlyArray<string>;
}): ContractDifferenceAnalysis {
    const currentKeys = new Set(payloadKeys(input.current));
    const proposedKeys = new Set(payloadKeys(input.proposed));
    const addedKeys: string[] = [];
    const removedKeys: string[] = [];
    const changedKeys: string[] = [];
    const unchangedKeys: string[] = [];

    for (const key of proposedKeys) {
        if (!currentKeys.has(key)) {
            addedKeys.push(key);
        } else if (
            JSON.stringify(input.current.payload[key]) !==
            JSON.stringify(input.proposed.payload[key])
        ) {
            changedKeys.push(key);
        } else {
            unchangedKeys.push(key);
        }
    }
    for (const key of currentKeys) {
        if (!proposedKeys.has(key)) {
            removedKeys.push(key);
        }
    }

    const touched = [...addedKeys, ...removedKeys, ...changedKeys];
    const coreIds = new Set(input.coreContractIds ?? ["ASA-CORE", "CORE"]);
    const frozenIds = new Set(input.frozenContractIds ?? []);
    const touchesCore = touched.some(
        (k) =>
            coreIds.has(k) ||
            k.startsWith("ASA-CORE") ||
            k.includes("core_contract")
    );
    const touchesFrozen = touched.some((k) => frozenIds.has(k));

    return Object.freeze({
        analysisId: input.analysisId,
        currentSnapshotId: input.current.snapshotId,
        proposedSnapshotId: input.proposed.snapshotId,
        addedKeys: Object.freeze(addedKeys),
        removedKeys: Object.freeze(removedKeys),
        changedKeys: Object.freeze(changedKeys),
        unchangedKeys: Object.freeze(unchangedKeys),
        touchesCore,
        touchesFrozen,
        analysisIsNotMutation: true as const,
    });
}
