/**
 * ASA-ARCH-38.0 - AI Provider / Runtime / Session Model (Draft 0.5)
 *
 * Provider = Capability Source
 * Runtime  = Execution Environment (intelligence env, not ASA Execution Authority)
 * Session  = Inference Context
 */

/** Provider / Runtime / Session layer kinds. */
export type AiRuntimeLayerKind = "PROVIDER" | "RUNTIME" | "SESSION";

/**
 * AI Runtime Boundary Contract.
 */
export interface AiRuntimeBoundary {
    readonly boundaryId: string;
    readonly layers: ReadonlyArray<AiRuntimeLayerKind>;
    readonly providerIsCapabilitySource: true;
    readonly runtimeIsIntelligenceEnvironment: true;
    readonly sessionIsInferenceContext: true;
    readonly forbidsAsaExecutionAuthority: true;
    readonly forbidsCoreStateCoupling: true;
}

/**
 * AI Session Management Contract.
 */
export interface AiSessionContract {
    readonly sessionContractId: string;
    readonly requiresSessionIdOnProposal: true;
    readonly sessionIsEphemeralContext: true;
    readonly forbidsSessionAsCoreState: true;
}

export function freezeAiRuntimeBoundary(
    boundary: AiRuntimeBoundary
): AiRuntimeBoundary {
    return Object.freeze({
        ...boundary,
        layers: Object.freeze([...boundary.layers]),
    });
}

export function freezeAiSessionContract(
    contract: AiSessionContract
): AiSessionContract {
    return Object.freeze({ ...contract });
}
