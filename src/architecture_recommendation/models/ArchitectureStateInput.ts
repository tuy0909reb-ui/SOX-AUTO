/**
 * ASA-ARCH-49.0 — ArchitectureStateInput（immutable input state reference）
 */

import type {
    ArchitectureStateHash,
    EvidenceReference,
    IntelligenceOutputReference,
    TraceabilityReference,
} from "../types";

export interface ArchitectureStateInput {
    readonly kind: "ArchitectureStateInput";
    readonly architectureStateHash: ArchitectureStateHash;
    readonly traceabilityReference: TraceabilityReference;
    readonly evidenceReference: EvidenceReference;
    readonly intelligenceOutputReference: IntelligenceOutputReference;
    readonly frozenArchitectureMetadata: readonly string[];
    readonly constraintDefinitions: readonly string[];
    readonly immutable: true;
    readonly doesNotDecide: true;
}

export function freezeArchitectureStateInput(input: {
    architectureStateHash: ArchitectureStateHash;
    traceabilityReference: TraceabilityReference;
    evidenceReference: EvidenceReference;
    intelligenceOutputReference: IntelligenceOutputReference;
    frozenArchitectureMetadata?: readonly string[];
    constraintDefinitions?: readonly string[];
}): ArchitectureStateInput {
    return Object.freeze({
        kind: "ArchitectureStateInput",
        architectureStateHash: input.architectureStateHash,
        traceabilityReference: input.traceabilityReference,
        evidenceReference: input.evidenceReference,
        intelligenceOutputReference: input.intelligenceOutputReference,
        frozenArchitectureMetadata: Object.freeze([
            ...(input.frozenArchitectureMetadata ?? []),
        ]),
        constraintDefinitions: Object.freeze([
            ...(input.constraintDefinitions ?? []),
        ]),
        immutable: true,
        doesNotDecide: true,
    });
}
