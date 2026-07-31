/**
 * ASA-ARCH-38.0 - AI Security / Audit / Trace / Determinism (Draft 0.5)
 *
 * Declarative security and accountability contracts.
 */

/** AI-specific attack detection kinds. */
export type AiSecurityThreatKind =
    | "PROMPT_INJECTION"
    | "TOOL_INJECTION"
    | "MEMORY_POISONING"
    | "MODEL_POISONING";

/**
 * AI Security Contract.
 */
export interface AiSecurityContract {
    readonly securityContractId: string;
    readonly threatKinds: ReadonlyArray<AiSecurityThreatKind>;
    readonly detectMitigateReportRequired: true;
    readonly forbidsGenerateAuthority: true;
    readonly forbidsCreatePrivileges: true;
    readonly forbidsBypassValidation: true;
    readonly forbidsBypassAuthentication: true;
    readonly forbidsModifySecurityPolicy: true;
    readonly forbidsAccessRestrictedState: true;
    readonly modelPoisoningIsProviderResponsibility: true;
}

/**
 * AI Audit Contract.
 */
export interface AiAuditContract {
    readonly auditContractId: string;
    readonly requiredFields: ReadonlyArray<
        | "input"
        | "output"
        | "evidence"
        | "assumptions"
        | "uncertainties"
        | "reasoningSummary"
        | "provider"
        | "timestamp"
    >;
}

/**
 * AI Traceability Contract.
 */
export interface AiTraceabilityContract {
    readonly traceContractId: string;
    readonly requiredStages: ReadonlyArray<
        | "input"
        | "interpretation"
        | "analysis"
        | "evaluation"
        | "proposal"
        | "reasoningPath"
    >;
}

/**
 * Determinism Policy Contract — execution metadata requirements.
 */
export interface AiDeterminismPolicy {
    readonly policyId: string;
    readonly requiredMetadata: ReadonlyArray<
        | "temperature"
        | "top_p"
        | "randomness"
        | "seed"
        | "deterministicMode"
        | "modelVersion"
        | "knowledgeVersion"
        | "environmentVersion"
    >;
}

export function freezeAiSecurityContract(
    contract: AiSecurityContract
): AiSecurityContract {
    return Object.freeze({
        ...contract,
        threatKinds: Object.freeze([...contract.threatKinds]),
    });
}

export function freezeAiAuditContract(
    contract: AiAuditContract
): AiAuditContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeAiTraceabilityContract(
    contract: AiTraceabilityContract
): AiTraceabilityContract {
    return Object.freeze({
        ...contract,
        requiredStages: Object.freeze([...contract.requiredStages]),
    });
}

export function freezeAiDeterminismPolicy(
    policy: AiDeterminismPolicy
): AiDeterminismPolicy {
    return Object.freeze({
        ...policy,
        requiredMetadata: Object.freeze([...policy.requiredMetadata]),
    });
}
