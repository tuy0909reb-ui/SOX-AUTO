/**
 * ASA-ARCH-41.0 - ASA-SCENARIO Establishment Builder (Draft 0.5)
 *
 * Establishes the immutable ASA-SCENARIO Extension Scenario Definition Layer.
 * Consumes frozen ASA-ARCH-35.1 Extension Development Framework by reference.
 * Does NOT mutate Core, Governance, Framework, or frozen Extensions 36–40.
 *
 * Structural validation only — Read Only; not a scenario / execution engine.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import {
    AsaScenarioLayer,
    type AsaScenarioLayerMetadata,
    type ScenarioLayerSecurityBoundary,
    type ScenarioSiblingIndependence,
} from "./AsaScenarioLayer";
import {
    freezeScenarioCompositionContract,
    type ScenarioCompositionContract,
    type ScenarioCompositionField,
    type ScenarioCompositionType,
} from "./ScenarioComposition";
import {
    freezeScenarioContract,
    freezeScenarioExtensionContract,
    type ScenarioContract,
    type ScenarioExtensionContract,
    type ScenarioOperation,
} from "./ScenarioContract";
import {
    freezeScenarioDefinitionContract,
    freezeScenarioLifecycleContract,
    type ScenarioDefinitionContract,
    type ScenarioDefinitionField,
    type ScenarioDefinitionLifecycleState,
    type ScenarioLifecycleContract,
} from "./ScenarioDefinition";
import {
    freezeScenarioAiBoundary,
    freezeScenarioCoordinationBoundary,
    freezeScenarioDeterminismPolicy,
    freezeScenarioDiscoveryContract,
    freezeScenarioInputBoundary,
    freezeScenarioMemoryContract,
    freezeScenarioOutputBoundary,
    freezeScenarioParticipationBoundary,
    freezeScenarioProviderRole,
    freezeScenarioRegistrationContract,
    freezeScenarioSecurityContract,
    freezeScenarioSelectionContract,
    freezeScenarioValidationBoundary,
    freezeSelfScenarioRestriction,
    type ScenarioAiBoundary,
    type ScenarioCoordinationBoundary,
    type ScenarioDeterminismPolicy,
    type ScenarioDiscoveryContract,
    type ScenarioInputBoundary,
    type ScenarioInputKind,
    type ScenarioMemoryContract,
    type ScenarioMemoryLayerKind,
    type ScenarioOutputBoundary,
    type ScenarioOutputKind,
    type ScenarioParticipationBoundary,
    type ScenarioProviderRole,
    type ScenarioRegistrationContract,
    type ScenarioSecurityContract,
    type ScenarioSelectionContract,
    type ScenarioValidationBoundary,
    type SelfScenarioRestriction,
} from "./ScenarioProvider";

const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const REQUIRED_FRAMEWORK_ARCH = "ASA-ARCH-35.1";

const REQUIRED_OPS: ReadonlyArray<ScenarioOperation> = [
    "define",
    "describe",
    "composeReference",
    "addConstraint",
    "review",
];
const REQUIRED_DEF_FIELDS: ReadonlyArray<ScenarioDefinitionField> = [
    "id",
    "name",
    "objective",
    "scenarioScope",
    "scenarioParticipants",
    "capabilityReferences",
    "interactionIntent",
    "constraints",
    "intendedOutcomeDescription",
    "version",
    "timestamp",
];
const REQUIRED_COMP_FIELDS: ReadonlyArray<ScenarioCompositionField> = [
    "scenarioId",
    "components",
    "relationships",
    "constraints",
    "compositionType",
    "timestamp",
];
const REQUIRED_COMP_TYPES: ReadonlyArray<ScenarioCompositionType> = [
    "static",
    "dynamic",
    "conditional",
];
const REQUIRED_LIFECYCLE: ReadonlyArray<ScenarioDefinitionLifecycleState> = [
    "Created",
    "Defined",
    "Reviewed",
    "Released",
    "Deprecated",
    "Archived",
    "Rejected",
];
const REQUIRED_PROVIDER_OPS = [
    "createScenarioDefinition",
    "describeScenario",
    "composeReference",
    "addConstraint",
    "requestReview",
] as const;
const REQUIRED_INPUTS: ReadonlyArray<ScenarioInputKind> = [
    "EXTENSION_METADATA",
    "EXTENSION_CONTRACT_DEFINITION",
    "DECLARED_CAPABILITY",
    "REGISTRY_INFORMATION",
    "COORDINATION_METADATA_REFERENCE",
    "VALIDATION_RESULT_REFERENCE",
    "AI_CAPABILITY_REFERENCE",
    "OPS_OBSERVATION_REFERENCE",
    "CONNECT_CAPABILITY_REFERENCE",
    "HUMAN_INSTRUCTION",
];
const REQUIRED_OUTPUTS: ReadonlyArray<ScenarioOutputKind> = [
    "SCENARIO_DEFINITION",
    "SCENARIO_DESCRIPTION",
    "SCENARIO_COMPOSITION",
    "SCENARIO_REVIEW_REQUEST",
];
const REQUIRED_MEMORY: ReadonlyArray<ScenarioMemoryLayerKind> = [
    "SCENARIO_DRAFT_RECORD",
    "SCENARIO_VERSION_RECORD",
    "SCENARIO_HISTORY_RECORD",
];
const REQUIRED_REG = [
    "metadata",
    "authority",
    "capabilities",
    "version",
    "scenarioDomainScope",
    "supportedContracts",
    "securityProfile",
    "determinismProfile",
] as const;
const REQUIRED_DETERMINISM = [
    "scenarioVersion",
    "definitionHash",
    "referenceHash",
    "contractVersion",
    "participantVersion",
    "referenceResolutionVersion",
    "constraintVersion",
    "environmentVersion",
    "configurationVersion",
    "timestamp",
] as const;

/**
 * Structural validator that establishes the ASA-SCENARIO layer.
 * Validation is Read Only — does not mutate scenario or grant authority.
 */
export class ScenarioValidator {
    private layerId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceFramework: ExtensionDevelopmentFramework | undefined;
    private extensionContract: ScenarioExtensionContract | undefined;
    private scenarioContract: ScenarioContract | undefined;
    private definitionContract: ScenarioDefinitionContract | undefined;
    private compositionContract: ScenarioCompositionContract | undefined;
    private lifecycleContract: ScenarioLifecycleContract | undefined;
    private providerRole: ScenarioProviderRole | undefined;
    private inputBoundary: ScenarioInputBoundary | undefined;
    private outputBoundary: ScenarioOutputBoundary | undefined;
    private participationBoundary: ScenarioParticipationBoundary | undefined;
    private coordinationBoundary: ScenarioCoordinationBoundary | undefined;
    private validationBoundary: ScenarioValidationBoundary | undefined;
    private aiBoundary: ScenarioAiBoundary | undefined;
    private memoryContract: ScenarioMemoryContract | undefined;
    private securityContract: ScenarioSecurityContract | undefined;
    private selfScenarioRestriction: SelfScenarioRestriction | undefined;
    private registrationContract: ScenarioRegistrationContract | undefined;
    private discoveryContract: ScenarioDiscoveryContract | undefined;
    private selectionContract: ScenarioSelectionContract | undefined;
    private determinismPolicy: ScenarioDeterminismPolicy | undefined;

    withLayerId(layerId: string): this {
        this.layerId = layerId;
        return this;
    }
    withArchitectureVersion(architectureVersion: string): this {
        this.architectureVersion = architectureVersion;
        return this;
    }
    withStructuralVersion(structuralVersion: string): this {
        this.structuralVersion = structuralVersion;
        return this;
    }
    withSchemaVersion(schemaVersion: string): this {
        this.schemaVersion = schemaVersion;
        return this;
    }
    withCreationTimestamp(creationTimestamp: string): this {
        this.creationTimestamp = creationTimestamp;
        return this;
    }
    withProducerIdentity(producerIdentity: string): this {
        this.producerIdentity = producerIdentity;
        return this;
    }
    withSourceFramework(sourceFramework: ExtensionDevelopmentFramework): this {
        this.sourceFramework = sourceFramework;
        return this;
    }
    withExtensionContract(extensionContract: ScenarioExtensionContract): this {
        this.extensionContract = extensionContract;
        return this;
    }
    withScenarioContract(scenarioContract: ScenarioContract): this {
        this.scenarioContract = scenarioContract;
        return this;
    }
    withDefinitionContract(definitionContract: ScenarioDefinitionContract): this {
        this.definitionContract = definitionContract;
        return this;
    }
    withCompositionContract(
        compositionContract: ScenarioCompositionContract
    ): this {
        this.compositionContract = compositionContract;
        return this;
    }
    withLifecycleContract(lifecycleContract: ScenarioLifecycleContract): this {
        this.lifecycleContract = lifecycleContract;
        return this;
    }
    withProviderRole(providerRole: ScenarioProviderRole): this {
        this.providerRole = providerRole;
        return this;
    }
    withInputBoundary(inputBoundary: ScenarioInputBoundary): this {
        this.inputBoundary = inputBoundary;
        return this;
    }
    withOutputBoundary(outputBoundary: ScenarioOutputBoundary): this {
        this.outputBoundary = outputBoundary;
        return this;
    }
    withParticipationBoundary(
        participationBoundary: ScenarioParticipationBoundary
    ): this {
        this.participationBoundary = participationBoundary;
        return this;
    }
    withCoordinationBoundary(
        coordinationBoundary: ScenarioCoordinationBoundary
    ): this {
        this.coordinationBoundary = coordinationBoundary;
        return this;
    }
    withValidationBoundary(
        validationBoundary: ScenarioValidationBoundary
    ): this {
        this.validationBoundary = validationBoundary;
        return this;
    }
    withAiBoundary(aiBoundary: ScenarioAiBoundary): this {
        this.aiBoundary = aiBoundary;
        return this;
    }
    withMemoryContract(memoryContract: ScenarioMemoryContract): this {
        this.memoryContract = memoryContract;
        return this;
    }
    withSecurityContract(securityContract: ScenarioSecurityContract): this {
        this.securityContract = securityContract;
        return this;
    }
    withSelfScenarioRestriction(
        selfScenarioRestriction: SelfScenarioRestriction
    ): this {
        this.selfScenarioRestriction = selfScenarioRestriction;
        return this;
    }
    withRegistrationContract(
        registrationContract: ScenarioRegistrationContract
    ): this {
        this.registrationContract = registrationContract;
        return this;
    }
    withDiscoveryContract(discoveryContract: ScenarioDiscoveryContract): this {
        this.discoveryContract = discoveryContract;
        return this;
    }
    withSelectionContract(selectionContract: ScenarioSelectionContract): this {
        this.selectionContract = selectionContract;
        return this;
    }
    withDeterminismPolicy(determinismPolicy: ScenarioDeterminismPolicy): this {
        this.determinismPolicy = determinismPolicy;
        return this;
    }

    /**
     * Establishes the immutable ASA-SCENARIO layer after structural validation.
     */
    establish(): AsaScenarioLayer {
        const layerId = this.requireNonEmpty(this.layerId, "layerId");
        const architectureVersion = this.requireNonEmpty(
            this.architectureVersion,
            "architectureVersion"
        );
        const structuralVersion = this.requireNonEmpty(
            this.structuralVersion,
            "structuralVersion"
        );
        const schemaVersion = this.requireNonEmpty(
            this.schemaVersion,
            "schemaVersion"
        );

        if (!this.sourceFramework) {
            throw new Error(
                "ASA-SCENARIO establishment failed: exactly one source Extension Development Framework is required"
            );
        }
        const framework = this.sourceFramework;
        if (!Object.isFrozen(framework) || !Object.isFrozen(framework.identity)) {
            throw new Error(
                "ASA-SCENARIO establishment failed: source Framework immutability verification failed"
            );
        }
        if (framework.identity.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Framework must preserve ASA-CORE-34.0"
            );
        }
        if (
            framework.identity.architectureVersion !== REQUIRED_FRAMEWORK_ARCH &&
            framework.metadata.architectureVersion !== REQUIRED_FRAMEWORK_ARCH
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Framework must be ASA-ARCH-35.1"
            );
        }
        if (framework.metadata.frameworkStatus !== "defined") {
            throw new Error(
                "ASA-SCENARIO establishment failed: Framework status must be defined"
            );
        }

        this.requirePresent(this.extensionContract, "ScenarioExtensionContract");
        this.requirePresent(this.scenarioContract, "ScenarioContract");
        this.requirePresent(this.definitionContract, "ScenarioDefinitionContract");
        this.requirePresent(
            this.compositionContract,
            "ScenarioCompositionContract"
        );
        this.requirePresent(this.lifecycleContract, "ScenarioLifecycleContract");
        this.requirePresent(this.providerRole, "ScenarioProviderRole");
        this.requirePresent(this.inputBoundary, "ScenarioInputBoundary");
        this.requirePresent(this.outputBoundary, "ScenarioOutputBoundary");
        this.requirePresent(
            this.participationBoundary,
            "ScenarioParticipationBoundary"
        );
        this.requirePresent(
            this.coordinationBoundary,
            "ScenarioCoordinationBoundary"
        );
        this.requirePresent(
            this.validationBoundary,
            "ScenarioValidationBoundary"
        );
        this.requirePresent(this.aiBoundary, "ScenarioAiBoundary");
        this.requirePresent(this.memoryContract, "ScenarioMemoryContract");
        this.requirePresent(this.securityContract, "ScenarioSecurityContract");
        this.requirePresent(
            this.selfScenarioRestriction,
            "SelfScenarioRestriction"
        );
        this.requirePresent(
            this.registrationContract,
            "ScenarioRegistrationContract"
        );
        this.requirePresent(this.discoveryContract, "ScenarioDiscoveryContract");
        this.requirePresent(this.selectionContract, "ScenarioSelectionContract");
        this.requirePresent(this.determinismPolicy, "ScenarioDeterminismPolicy");

        this.validateExtension(this.extensionContract!);
        this.validateScenario(this.scenarioContract!);
        this.validateDefinition(this.definitionContract!);
        this.validateComposition(this.compositionContract!);
        this.validateLifecycle(this.lifecycleContract!);
        this.validateProvider(this.providerRole!);
        this.validateInput(this.inputBoundary!);
        this.validateOutput(this.outputBoundary!);
        this.validateParticipation(this.participationBoundary!);
        this.validateCoordination(this.coordinationBoundary!);
        this.validateValidation(this.validationBoundary!);
        this.validateAi(this.aiBoundary!);
        this.validateMemory(this.memoryContract!);
        this.validateSecurity(this.securityContract!);
        this.validateSelf(this.selfScenarioRestriction!);
        this.validateRegistration(this.registrationContract!);
        this.validateDiscovery(this.discoveryContract!);
        this.validateSelection(this.selectionContract!);
        this.validateDeterminism(this.determinismPolicy!);

        const securityBoundary: ScenarioLayerSecurityBoundary = Object.freeze({
            holdsDecisionAuthority: false as const,
            holdsExecutionAuthority: false as const,
            holdsPolicyAuthority: false as const,
            holdsScenarioDesignerResponsibility: true as const,
            forbidsAuthorityEscalation: true as const,
        });
        const siblingIndependence: ScenarioSiblingIndependence = Object.freeze({
            peerToOps: true as const,
            peerToConnect: true as const,
            peerToAi: true as const,
            peerToValidation: true as const,
            peerToCoordination: true as const,
            forbidsOpsDependencyOwnership: true as const,
            forbidsConnectDependencyOwnership: true as const,
            forbidsAiDependencyOwnership: true as const,
            forbidsValidationDependencyOwnership: true as const,
            forbidsCoordinationDependencyOwnership: true as const,
            forbidsCoreIntrusion: true as const,
        });
        const metadata: AsaScenarioLayerMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesGovernanceContract: true as const,
            preservesFrameworkContract: true as const,
            preservesOpsContract: true as const,
            preservesConnectContract: true as const,
            preservesAiContract: true as const,
            preservesValidationContract: true as const,
            preservesCoordinationContract: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new AsaScenarioLayer({
            identity: Object.freeze({
                layerId,
                extensionId: "ASA-SCENARIO" as const,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
                sourceFrameworkId: framework.identity.frameworkId,
            }),
            metadata,
            sourceFramework: framework,
            extensionContract: freezeScenarioExtensionContract(
                this.extensionContract!
            ),
            scenarioContract: freezeScenarioContract(this.scenarioContract!),
            definitionContract: freezeScenarioDefinitionContract(
                this.definitionContract!
            ),
            compositionContract: freezeScenarioCompositionContract(
                this.compositionContract!
            ),
            lifecycleContract: freezeScenarioLifecycleContract(
                this.lifecycleContract!
            ),
            providerRole: freezeScenarioProviderRole(this.providerRole!),
            inputBoundary: freezeScenarioInputBoundary(this.inputBoundary!),
            outputBoundary: freezeScenarioOutputBoundary(this.outputBoundary!),
            participationBoundary: freezeScenarioParticipationBoundary(
                this.participationBoundary!
            ),
            coordinationBoundary: freezeScenarioCoordinationBoundary(
                this.coordinationBoundary!
            ),
            validationBoundary: freezeScenarioValidationBoundary(
                this.validationBoundary!
            ),
            aiBoundary: freezeScenarioAiBoundary(this.aiBoundary!),
            memoryContract: freezeScenarioMemoryContract(this.memoryContract!),
            securityContract: freezeScenarioSecurityContract(
                this.securityContract!
            ),
            selfScenarioRestriction: freezeSelfScenarioRestriction(
                this.selfScenarioRestriction!
            ),
            registrationContract: freezeScenarioRegistrationContract(
                this.registrationContract!
            ),
            discoveryContract: freezeScenarioDiscoveryContract(
                this.discoveryContract!
            ),
            selectionContract: freezeScenarioSelectionContract(
                this.selectionContract!
            ),
            determinismPolicy: freezeScenarioDeterminismPolicy(
                this.determinismPolicy!
            ),
            securityBoundary,
            siblingIndependence,
        });
    }

    private validateExtension(c: ScenarioExtensionContract): void {
        if (c.id !== "ASA-SCENARIO") {
            throw new Error(
                "ASA-SCENARIO establishment failed: Extension Identifier must be ASA-SCENARIO"
            );
        }
        this.requireNonEmpty(c.version, "extensionContract.version");
        if (c.domain !== "Scenario" || c.frameworkDomain !== "SCENARIO") {
            throw new Error(
                "ASA-SCENARIO establishment failed: domain/frameworkDomain must be Scenario/SCENARIO"
            );
        }
        if (c.authority !== "SCENARIO_DESIGNER") {
            throw new Error(
                "ASA-SCENARIO establishment failed: Authority Declaration must be SCENARIO_DESIGNER"
            );
        }
        this.requireNonEmpty(c.description, "extensionContract.description");
        this.requireNonEmpty(
            c.governanceOwner,
            "extensionContract.governanceOwner"
        );
        for (const req of [
            REQUIRED_CORE_VERSION,
            "ASA-ARCH-35.x",
            "ASA-ARCH-35.1",
            "ASA-ARCH-36.0",
            "ASA-ARCH-37.0",
            "ASA-ARCH-38.0",
            "ASA-ARCH-39.0",
            "ASA-ARCH-40.0",
        ]) {
            if (!c.compatibility.includes(req)) {
                throw new Error(
                    `ASA-SCENARIO establishment failed: compatibility must include ${req}`
                );
            }
        }
        if (
            c.forbidsExecute !== true ||
            c.forbidsInvokeRuntime !== true ||
            c.forbidsCoreMutation !== true ||
            c.forbidsGenerateExecutionPermission !== true ||
            c.scenarioIsNotExecution !== true ||
            c.declarativeAuthorityIsNotOperationalAuthority !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Authority Boundary invalid"
            );
        }
        if (
            c.permitsDefineScenarioMetadata !== true ||
            c.permitsRequestReview !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: SCENARIO_DESIGNER permitted operations incomplete"
            );
        }
    }

    private validateScenario(c: ScenarioContract): void {
        this.requireNonEmpty(c.contractId, "scenarioContract.contractId");
        this.requireAllPresent(c.operations, REQUIRED_OPS, "Scenario operations");
        if (
            c.forbidsExecute !== true ||
            c.forbidsInvokeRuntime !== true ||
            c.forbidsAuthorize !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Execution Isolation invalid"
            );
        }
    }

    private validateDefinition(c: ScenarioDefinitionContract): void {
        this.requireNonEmpty(
            c.definitionContractId,
            "definitionContract.definitionContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_DEF_FIELDS,
            "Definition fields"
        );
        if (
            c.capabilityReferenceDoesNotActivate !== true ||
            c.capabilityReferenceDoesNotCreateDependency !== true ||
            c.intendedOutcomeIsNotExecutionResult !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Capability Reference / Outcome Isolation invalid"
            );
        }
    }

    private validateComposition(c: ScenarioCompositionContract): void {
        this.requireNonEmpty(
            c.compositionContractId,
            "compositionContract.compositionContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_COMP_FIELDS,
            "Composition fields"
        );
        this.requireAllPresent(
            c.allowedCompositionTypes,
            REQUIRED_COMP_TYPES,
            "Composition types"
        );
        if (
            c.dynamicCompositionIsNotDynamicExecution !== true ||
            c.compositionDoesNotDefineExecutionOrder !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Dynamic Composition boundary invalid"
            );
        }
    }

    private validateLifecycle(c: ScenarioLifecycleContract): void {
        this.requireNonEmpty(
            c.lifecycleContractId,
            "lifecycleContract.lifecycleContractId"
        );
        this.requireOrdered(c.allowedStates, REQUIRED_LIFECYCLE, "Lifecycle states");
        if (
            c.releasedDoesNotMeanExecutable !== true ||
            c.scenarioLifecycleIsNotExtensionLifecycle !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Scenario Lifecycle Boundary invalid"
            );
        }
    }

    private validateProvider(c: ScenarioProviderRole): void {
        this.requireNonEmpty(c.roleId, "providerRole.roleId");
        this.requireAllPresent(
            c.operations,
            REQUIRED_PROVIDER_OPS,
            "Provider operations"
        );
        if (
            c.isNotExecutionProvider !== true ||
            c.forbidsExecute !== true ||
            c.forbidsInvokeRuntime !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Provider must forbid execution"
            );
        }
    }

    private validateInput(c: ScenarioInputBoundary): void {
        this.requireNonEmpty(c.boundaryId, "inputBoundary.boundaryId");
        this.requireAllPresent(c.allowedInputs, REQUIRED_INPUTS, "Inputs");
        if (
            c.inputIsReadOnly !== true ||
            c.forbidsPrivateExtensionStateAccess !== true ||
            c.humanInstructionIsNotExecutionAuthorization !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Input Boundary invalid"
            );
        }
    }

    private validateOutput(c: ScenarioOutputBoundary): void {
        this.requireNonEmpty(c.boundaryId, "outputBoundary.boundaryId");
        this.requireAllPresent(c.allowedOutputs, REQUIRED_OUTPUTS, "Outputs");
        if (
            c.forbidsExecutionCommand !== true ||
            c.definitionIsNotExecutionPlan !== true ||
            c.publicationIsNotExecutionAuthorization !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Output / Non Execution Boundary invalid"
            );
        }
    }

    private validateParticipation(c: ScenarioParticipationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "participationBoundary.boundaryId");
        if (
            c.forbidsForceParticipation !== true ||
            c.forbidsImplicitDependencyCreation !== true ||
            c.referencesSiblingsViaDeclaredContractsOnly !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Extension Isolation invalid"
            );
        }
    }

    private validateCoordination(c: ScenarioCoordinationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "coordinationBoundary.boundaryId");
        if (
            c.integratesWithCoordinationReadOnly !== true ||
            c.scenarioDefinitionIsNotCoordinationExecution !== true ||
            c.scenarioDoesNotRequireCoordination !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Coordination Compatibility invalid"
            );
        }
    }

    private validateValidation(c: ScenarioValidationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "validationBoundary.boundaryId");
        if (
            c.integratesWithValidationReadOnly !== true ||
            c.validationResultIsNotScenarioControl !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Validation Compatibility invalid"
            );
        }
    }

    private validateAi(c: ScenarioAiBoundary): void {
        this.requireNonEmpty(c.boundaryId, "aiBoundary.boundaryId");
        if (
            c.aiCapabilityReferenceIsNotAiAuthority !== true ||
            c.forbidsBecomeAiAuthority !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: AI Boundary invalid"
            );
        }
    }

    private validateMemory(c: ScenarioMemoryContract): void {
        this.requireNonEmpty(c.memoryContractId, "memoryContract.memoryContractId");
        this.requireAllPresent(c.layers, REQUIRED_MEMORY, "Memory layers");
        if (
            c.memoryIsNotCoreState !== true ||
            c.memoryNeverGrantsAuthority !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Memory Boundary invalid"
            );
        }
    }

    private validateSecurity(c: ScenarioSecurityContract): void {
        this.requireNonEmpty(
            c.securityContractId,
            "securityContract.securityContractId"
        );
        if (
            c.forbidsForgeScenarioDefinition !== true ||
            c.forbidsGrantPrivileges !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Security Compliance invalid"
            );
        }
    }

    private validateSelf(c: SelfScenarioRestriction): void {
        this.requireNonEmpty(c.restrictionId, "selfScenarioRestriction.restrictionId");
        if (
            c.forbidsApproveOwnAuthority !== true ||
            c.forbidsModifyOwnContract !== true ||
            c.requiresIndependentValidation !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Self Scenario Restriction invalid"
            );
        }
    }

    private validateRegistration(c: ScenarioRegistrationContract): void {
        this.requireNonEmpty(
            c.registrationContractId,
            "registrationContract.registrationContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_REG,
            "Registration fields"
        );
        if (
            c.authorityMustBeScenarioDesigner !== true ||
            c.registrationDoesNotGrantExecutionAuthority !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Registration Compliance invalid"
            );
        }
    }

    private validateDiscovery(c: ScenarioDiscoveryContract): void {
        this.requireNonEmpty(
            c.discoveryContractId,
            "discoveryContract.discoveryContractId"
        );
        if (
            c.returnsScenarioMetadataOnly !== true ||
            c.forbidsExecuteScenario !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Discovery Contract invalid"
            );
        }
    }

    private validateSelection(c: ScenarioSelectionContract): void {
        this.requireNonEmpty(
            c.selectionContractId,
            "selectionContract.selectionContractId"
        );
        if (
            c.producesRecommendationOnly !== true ||
            c.forbidsAuthorizeExecution !== true
        ) {
            throw new Error(
                "ASA-SCENARIO establishment failed: Selection Contract invalid"
            );
        }
    }

    private validateDeterminism(c: ScenarioDeterminismPolicy): void {
        this.requireNonEmpty(c.policyId, "determinismPolicy.policyId");
        this.requireAllPresent(
            c.requiredMetadata,
            REQUIRED_DETERMINISM,
            "Determinism metadata"
        );
    }

    private requirePresent<T>(
        value: T | undefined,
        label: string
    ): asserts value is T {
        if (value === undefined) {
            throw new Error(
                `ASA-SCENARIO establishment failed: ${label} is required`
            );
        }
    }

    private requireAllPresent<T extends string>(
        actual: ReadonlyArray<T>,
        required: ReadonlyArray<T>,
        label: string
    ): void {
        for (const item of required) {
            if (!actual.includes(item)) {
                throw new Error(
                    `ASA-SCENARIO establishment failed: ${label} missing ${item}`
                );
            }
        }
    }

    private requireOrdered(
        actual: ReadonlyArray<string>,
        required: ReadonlyArray<string>,
        label: string
    ): void {
        if (
            !actual ||
            actual.length !== required.length ||
            required.some((s, i) => actual[i] !== s)
        ) {
            throw new Error(
                `ASA-SCENARIO establishment failed: ${label} incomplete or out of order`
            );
        }
    }

    private requireNonEmpty(value: string | undefined, field: string): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ASA-SCENARIO establishment failed: ${field} is required`
            );
        }
        return value;
    }
}
