/**
 * ASA-ARCH-37.0 - Connector Lifecycle Validator Contract (Draft 0.3)
 *
 * Lifecycle follows ASA-ARCH-35.0 / 35.1 Extension Lifecycle Contract.
 * Governance Validation required for add / change / retire.
 */

import type { ExtensionFrameworkLifecycleState } from "../../extension_development_framework/ExtensionDevelopmentFrameworkTypes";

/**
 * Connector Lifecycle Validation Contract.
 */
export interface ConnectorLifecycleValidatorContract {
    readonly lifecycleValidatorId: string;
    readonly allowedStates: ReadonlyArray<ExtensionFrameworkLifecycleState>;
    readonly requiresGovernanceValidation: true;
    readonly isGovernanceManaged: true;
    readonly forbidsIndividualImplementationJudgment: true;
}

export function freezeConnectorLifecycleValidatorContract(
    contract: ConnectorLifecycleValidatorContract
): ConnectorLifecycleValidatorContract {
    return Object.freeze({
        ...contract,
        allowedStates: Object.freeze([...contract.allowedStates]),
    });
}
