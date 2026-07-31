/**
 * ASA-ARCH-41.0 - ASA-SCENARIO Extension Scenario Definition Layer (Draft 0.5)
 *
 * Immutable aggregate of Scenario domain contracts.
 * Scenario Designer — Declarative Authority only; not an Execution subject.
 *
 * SHALL NOT contain scenario engines, workflow engines, or execution engines.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import type { ScenarioCompositionContract } from "./ScenarioComposition";
import type {
    ScenarioContract,
    ScenarioExtensionContract,
} from "./ScenarioContract";
import type {
    ScenarioDefinitionContract,
    ScenarioLifecycleContract,
} from "./ScenarioDefinition";
import type {
    ScenarioAiBoundary,
    ScenarioCoordinationBoundary,
    ScenarioDeterminismPolicy,
    ScenarioDiscoveryContract,
    ScenarioInputBoundary,
    ScenarioMemoryContract,
    ScenarioOutputBoundary,
    ScenarioParticipationBoundary,
    ScenarioProviderRole,
    ScenarioRegistrationContract,
    ScenarioSecurityContract,
    ScenarioSelectionContract,
    ScenarioValidationBoundary,
    SelfScenarioRestriction,
} from "./ScenarioProvider";

export type AsaScenarioLayerId = string;

export interface ScenarioLayerSecurityBoundary {
    readonly holdsDecisionAuthority: false;
    readonly holdsExecutionAuthority: false;
    readonly holdsPolicyAuthority: false;
    readonly holdsScenarioDesignerResponsibility: true;
    readonly forbidsAuthorityEscalation: true;
}

export interface ScenarioSiblingIndependence {
    readonly peerToOps: true;
    readonly peerToConnect: true;
    readonly peerToAi: true;
    readonly peerToValidation: true;
    readonly peerToCoordination: true;
    readonly forbidsOpsDependencyOwnership: true;
    readonly forbidsConnectDependencyOwnership: true;
    readonly forbidsAiDependencyOwnership: true;
    readonly forbidsValidationDependencyOwnership: true;
    readonly forbidsCoordinationDependencyOwnership: true;
    readonly forbidsCoreIntrusion: true;
}

export interface AsaScenarioLayerMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesGovernanceContract: true;
    readonly preservesFrameworkContract: true;
    readonly preservesOpsContract: true;
    readonly preservesConnectContract: true;
    readonly preservesAiContract: true;
    readonly preservesValidationContract: true;
    readonly preservesCoordinationContract: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

export interface AsaScenarioLayerProps {
    readonly identity: {
        readonly layerId: AsaScenarioLayerId;
        readonly extensionId: "ASA-SCENARIO";
        readonly coreVersion: "ASA-CORE-34.0";
        readonly architectureVersion: string;
        readonly structuralVersion: string;
        readonly sourceFrameworkId: string;
    };
    readonly metadata: AsaScenarioLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: ScenarioExtensionContract;
    readonly scenarioContract: ScenarioContract;
    readonly definitionContract: ScenarioDefinitionContract;
    readonly compositionContract: ScenarioCompositionContract;
    readonly lifecycleContract: ScenarioLifecycleContract;
    readonly providerRole: ScenarioProviderRole;
    readonly inputBoundary: ScenarioInputBoundary;
    readonly outputBoundary: ScenarioOutputBoundary;
    readonly participationBoundary: ScenarioParticipationBoundary;
    readonly coordinationBoundary: ScenarioCoordinationBoundary;
    readonly validationBoundary: ScenarioValidationBoundary;
    readonly aiBoundary: ScenarioAiBoundary;
    readonly memoryContract: ScenarioMemoryContract;
    readonly securityContract: ScenarioSecurityContract;
    readonly selfScenarioRestriction: SelfScenarioRestriction;
    readonly registrationContract: ScenarioRegistrationContract;
    readonly discoveryContract: ScenarioDiscoveryContract;
    readonly selectionContract: ScenarioSelectionContract;
    readonly determinismPolicy: ScenarioDeterminismPolicy;
    readonly securityBoundary: ScenarioLayerSecurityBoundary;
    readonly siblingIndependence: ScenarioSiblingIndependence;
}

export class AsaScenarioLayer implements AsaScenarioLayerProps {
    readonly identity: AsaScenarioLayerProps["identity"];
    readonly metadata: AsaScenarioLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: ScenarioExtensionContract;
    readonly scenarioContract: ScenarioContract;
    readonly definitionContract: ScenarioDefinitionContract;
    readonly compositionContract: ScenarioCompositionContract;
    readonly lifecycleContract: ScenarioLifecycleContract;
    readonly providerRole: ScenarioProviderRole;
    readonly inputBoundary: ScenarioInputBoundary;
    readonly outputBoundary: ScenarioOutputBoundary;
    readonly participationBoundary: ScenarioParticipationBoundary;
    readonly coordinationBoundary: ScenarioCoordinationBoundary;
    readonly validationBoundary: ScenarioValidationBoundary;
    readonly aiBoundary: ScenarioAiBoundary;
    readonly memoryContract: ScenarioMemoryContract;
    readonly securityContract: ScenarioSecurityContract;
    readonly selfScenarioRestriction: SelfScenarioRestriction;
    readonly registrationContract: ScenarioRegistrationContract;
    readonly discoveryContract: ScenarioDiscoveryContract;
    readonly selectionContract: ScenarioSelectionContract;
    readonly determinismPolicy: ScenarioDeterminismPolicy;
    readonly securityBoundary: ScenarioLayerSecurityBoundary;
    readonly siblingIndependence: ScenarioSiblingIndependence;

    /** Prefer ScenarioValidator.establish(). */
    constructor(init: AsaScenarioLayerProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceFramework = init.sourceFramework;
        this.extensionContract = init.extensionContract;
        this.scenarioContract = init.scenarioContract;
        this.definitionContract = init.definitionContract;
        this.compositionContract = init.compositionContract;
        this.lifecycleContract = init.lifecycleContract;
        this.providerRole = init.providerRole;
        this.inputBoundary = init.inputBoundary;
        this.outputBoundary = init.outputBoundary;
        this.participationBoundary = init.participationBoundary;
        this.coordinationBoundary = init.coordinationBoundary;
        this.validationBoundary = init.validationBoundary;
        this.aiBoundary = init.aiBoundary;
        this.memoryContract = init.memoryContract;
        this.securityContract = init.securityContract;
        this.selfScenarioRestriction = init.selfScenarioRestriction;
        this.registrationContract = init.registrationContract;
        this.discoveryContract = init.discoveryContract;
        this.selectionContract = init.selectionContract;
        this.determinismPolicy = init.determinismPolicy;
        this.securityBoundary = Object.freeze({ ...init.securityBoundary });
        this.siblingIndependence = Object.freeze({
            ...init.siblingIndependence,
        });
        Object.freeze(this);
    }
}
