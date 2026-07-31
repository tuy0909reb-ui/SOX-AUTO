/**
 * ASA-ARCH-35.1 - Extension Development Framework model (Draft 0.2)
 *
 * Immutable declarative development standard.
 *
 * Defines shared Extension Template Contract after frozen Governance Layer.
 * Does NOT mutate Core or Governance contracts.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import type { ExtensionGovernanceLayer } from "../extension_governance/ExtensionGovernanceLayer";
import {
    ExtensionDevelopmentFrameworkIdentity,
    ExtensionDevelopmentFrameworkMetadata,
    ExtensionDevelopmentFrameworkProps,
    ExtensionTemplateContract,
} from "./ExtensionDevelopmentFrameworkTypes";

/**
 * Immutable Extension Development Framework.
 * All fields are readonly; instances are Object.freeze'd at definition.
 */
export class ExtensionDevelopmentFramework
    implements ExtensionDevelopmentFrameworkProps
{
    readonly identity: ExtensionDevelopmentFrameworkIdentity;
    readonly metadata: ExtensionDevelopmentFrameworkMetadata;
    readonly sourceGovernanceLayer: ExtensionGovernanceLayer;
    readonly extensionTemplate: ExtensionTemplateContract;

    /**
     * Package-internal constructor.
     * Prefer ExtensionDevelopmentFrameworkBuilder.define().
     */
    constructor(init: ExtensionDevelopmentFrameworkProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceGovernanceLayer = init.sourceGovernanceLayer;
        this.extensionTemplate = freezeTemplate(init.extensionTemplate);
        Object.freeze(this);
    }
}

function freezeTemplate(
    template: ExtensionTemplateContract
): ExtensionTemplateContract {
    return Object.freeze({
        metadata: Object.freeze({ ...template.metadata }),
        contract: Object.freeze({
            ...template.contract,
            inputContractIds: Object.freeze([
                ...template.contract.inputContractIds,
            ]),
            outputContractIds: Object.freeze([
                ...template.contract.outputContractIds,
            ]),
            errorContract: Object.freeze({
                ...template.contract.errorContract,
            }),
        }),
        authority: Object.freeze({ ...template.authority }),
        lifecycle: template.lifecycle,
        dependency: Object.freeze([...template.dependency]),
        compatibility: Object.freeze({ ...template.compatibility }),
        validation: Object.freeze({
            ...template.validation,
            stages: Object.freeze([...template.validation.stages]),
        }),
        securityValidation: Object.freeze({
            ...template.securityValidation,
        }),
        regressionStandard: Object.freeze({
            ...template.regressionStandard,
        }),
        communicationContract: Object.freeze({
            ...template.communicationContract,
        }),
        ...(template.capabilityBinding !== undefined
            ? {
                  capabilityBinding: Object.freeze({
                      ...template.capabilityBinding,
                  }),
              }
            : {}),
    });
}
