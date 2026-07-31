/**
 * ASA-ARCH-36.0 - ASA-OPS Extension Contract (Draft 0.4)
 *
 * Declarative metadata / authority / compatibility surface for
 * the Operational Extension Layer.
 *
 * Authority is fixed to OBSERVER.
 * SHALL NOT contain runtime observation, logging, or execution semantics.
 */

import type { ExtensionAuthorityLevel } from "../../extension_governance/ExtensionGovernanceTypes";

/** Fixed Extension Identifier for ASA-OPS. */
export type AsaOpsExtensionId = "ASA-OPS";

/** Architecture domain label (Operational Extension). */
export type AsaOpsDomainLabel = "Operational";

/** Framework / governance domain kind binding. */
export type AsaOpsFrameworkDomain = "OPS";

/**
 * ASA-OPS Extension Metadata Contract.
 * Authority is structurally fixed to OBSERVER.
 */
export interface OpsExtensionContract {
    readonly id: AsaOpsExtensionId;
    readonly version: string;
    readonly domain: AsaOpsDomainLabel;
    readonly frameworkDomain: AsaOpsFrameworkDomain;
    readonly authority: Extract<ExtensionAuthorityLevel, "OBSERVER">;
    readonly compatibility: ReadonlyArray<string>;
    readonly description: string;
    readonly governanceOwner: string;
    readonly forbidsDecisionMaking: true;
    readonly forbidsExecutionTrigger: true;
    readonly forbidsWorkflowModification: true;
    readonly forbidsPolicyModification: true;
    readonly forbidsCoreMutation: true;
    readonly forbidsGovernanceMutation: true;
    readonly forbidsRegistryMutation: true;
    readonly permitsReadContext: true;
    readonly permitsCollectMetrics: true;
    readonly permitsGenerateLogs: true;
    readonly permitsCreateAuditRecords: true;
}

/**
 * Freezes an OPS Extension Contract after structural field presence checks.
 * Full establishment validation is performed by OpsValidator.
 */
export function freezeOpsExtensionContract(
    contract: OpsExtensionContract
): OpsExtensionContract {
    return Object.freeze({
        ...contract,
        compatibility: Object.freeze([...contract.compatibility]),
    });
}
