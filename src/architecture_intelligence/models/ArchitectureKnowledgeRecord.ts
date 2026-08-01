/**
 * ASA-ARCH-47.0 — ArchitectureKnowledgeRecord
 */

import type { ArchitectureIdentity, ArchitectureVersion } from "../types";

export interface ArchitectureKnowledgeRecord {
    readonly kind: "ArchitectureKnowledgeRecord";
    readonly architectureId: ArchitectureIdentity;
    readonly architectureVersion: ArchitectureVersion;
    readonly relationships: readonly string[];
    readonly frozenArchitectureRecords: readonly string[];
    readonly designDecision: string;
    readonly decisionRationale: string;
    readonly evolutionHistory: readonly string[];
    readonly verificationHistory: readonly string[];
    readonly immutable: true;
    readonly doesNotDecide: true;
}

export function freezeArchitectureKnowledgeRecord(input: {
    architectureId: ArchitectureIdentity;
    architectureVersion: ArchitectureVersion;
    relationships?: readonly string[];
    frozenArchitectureRecords?: readonly string[];
    designDecision: string;
    decisionRationale: string;
    evolutionHistory?: readonly string[];
    verificationHistory?: readonly string[];
}): ArchitectureKnowledgeRecord {
    return Object.freeze({
        kind: "ArchitectureKnowledgeRecord",
        architectureId: input.architectureId,
        architectureVersion: input.architectureVersion,
        relationships: Object.freeze([...(input.relationships ?? [])]),
        frozenArchitectureRecords: Object.freeze([
            ...(input.frozenArchitectureRecords ?? []),
        ]),
        designDecision: input.designDecision.trim(),
        decisionRationale: input.decisionRationale.trim(),
        evolutionHistory: Object.freeze([...(input.evolutionHistory ?? [])]),
        verificationHistory: Object.freeze([
            ...(input.verificationHistory ?? []),
        ]),
        immutable: true,
        doesNotDecide: true,
    });
}
