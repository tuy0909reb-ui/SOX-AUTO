/**
 * ASA-ARCH-38.0 - ASA-AI Extension Contract (Draft 0.5)
 *
 * Declarative metadata / authority / compatibility surface for
 * the Extension Intelligence Layer.
 *
 * Authority is fixed to ADVISOR.
 * Intelligence ≠ Authority; Proposal ≠ Execution.
 * SHALL NOT contain inference / model / networking runtime semantics.
 */

import type { ExtensionAuthorityLevel } from "../../extension_governance/ExtensionGovernanceTypes";
import type { ExtensionFrameworkLifecycleState } from "../../extension_development_framework/ExtensionDevelopmentFrameworkTypes";

/** Fixed Extension Identifier for ASA-AI. */
export type AsaAiExtensionId = "ASA-AI";

/** Architecture domain label. */
export type AsaAiDomainLabel = "Intelligence";

/** Framework / governance domain kind binding. */
export type AsaAiFrameworkDomain = "AI";

/**
 * ASA-AI Extension Metadata Contract.
 * Authority is structurally fixed to ADVISOR.
 */
export interface AiExtensionContract {
    readonly id: AsaAiExtensionId;
    readonly version: string;
    readonly domain: AsaAiDomainLabel;
    readonly frameworkDomain: AsaAiFrameworkDomain;
    readonly authority: Extract<ExtensionAuthorityLevel, "ADVISOR">;
    readonly lifecycle: ExtensionFrameworkLifecycleState;
    readonly compatibility: ReadonlyArray<string>;
    readonly description: string;
    readonly governanceOwner: string;
    readonly intelligenceIsNotAuthority: true;
    readonly proposalIsNotExecution: true;
    readonly knowledgeIsNotSystemState: true;
    readonly memoryIsNotCoreState: true;
    readonly learningIsNotArchitectureMutation: true;
    readonly inferenceIsNotTruth: true;
    readonly confidenceIsNotCorrectness: true;
    readonly forbidsExecute: true;
    readonly forbidsOverrideValidation: true;
    readonly forbidsOverrideGovernance: true;
    readonly forbidsOverridePolicy: true;
    readonly forbidsCoreMutation: true;
    readonly forbidsFrameworkMutation: true;
    readonly forbidsGovernanceMutation: true;
    readonly forbidsAuthorityEscalation: true;
    readonly forbidsRuntimeCapabilityRegistration: true;
    readonly forbidsRuntimeStateMutation: true;
    readonly forbidsSelfModification: true;
    readonly forbidsRequireAcceptance: true;
    readonly permitsInterpret: true;
    readonly permitsAnalyze: true;
    readonly permitsEvaluate: true;
    readonly permitsExplain: true;
    readonly permitsRecommend: true;
    readonly permitsGenerateProposal: true;
    readonly permitsRequestReview: true;
    readonly permitsGenerateExecutionProposal: true;
    readonly generateExecutionProposalIsNotExecutionRequest: true;
}

export function freezeAiExtensionContract(
    contract: AiExtensionContract
): AiExtensionContract {
    return Object.freeze({
        ...contract,
        compatibility: Object.freeze([...contract.compatibility]),
    });
}
