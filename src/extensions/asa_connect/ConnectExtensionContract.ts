/**
 * ASA-ARCH-37.0 - ASA-CONNECT Extension Contract (Draft 0.3)
 *
 * Declarative metadata / authority / lifecycle / compatibility / security
 * surface for the External Integration Boundary Layer.
 *
 * Authority is fixed to REQUESTER.
 * REQUESTER ≠ Execution Authority.
 * SHALL NOT contain runtime connector / networking semantics.
 */

import type { ExtensionAuthorityLevel } from "../../extension_governance/ExtensionGovernanceTypes";
import type { ExtensionFrameworkLifecycleState } from "../../extension_development_framework/ExtensionDevelopmentFrameworkTypes";

/** Fixed Extension Identifier for ASA-CONNECT. */
export type AsaConnectExtensionId = "ASA-CONNECT";

/** Architecture domain label. */
export type AsaConnectDomainLabel = "ExternalIntegration";

/** Framework / governance domain kind binding. */
export type AsaConnectFrameworkDomain = "CONNECT";

/**
 * ASA-CONNECT Extension Metadata Contract.
 * Authority is structurally fixed to REQUESTER.
 */
export interface ConnectExtensionContract {
    readonly id: AsaConnectExtensionId;
    readonly version: string;
    readonly domain: AsaConnectDomainLabel;
    readonly frameworkDomain: AsaConnectFrameworkDomain;
    readonly authority: Extract<ExtensionAuthorityLevel, "REQUESTER">;
    readonly lifecycle: ExtensionFrameworkLifecycleState;
    readonly compatibility: ReadonlyArray<string>;
    readonly description: string;
    readonly governanceOwner: string;
    readonly forbidsDecisionMaking: true;
    readonly forbidsDirectExecution: true;
    readonly forbidsCapabilityMutation: true;
    readonly forbidsCapabilityOwnership: true;
    readonly forbidsPolicyModification: true;
    readonly forbidsCoreMutation: true;
    readonly forbidsGovernanceMutation: true;
    readonly forbidsRegistryMutation: true;
    readonly forbidsWorkflowModification: true;
    readonly requesterIsNotExecutionAuthority: true;
    readonly permitsSubmitExternalRequest: true;
    readonly permitsValidateExternalResponse: true;
    readonly permitsTransformExternalData: true;
    readonly permitsCreateIntegrationEvent: true;
}

export function freezeConnectExtensionContract(
    contract: ConnectExtensionContract
): ConnectExtensionContract {
    return Object.freeze({
        ...contract,
        compatibility: Object.freeze([...contract.compatibility]),
    });
}
