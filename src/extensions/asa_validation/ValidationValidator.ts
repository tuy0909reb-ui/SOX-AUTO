/**
 * ASA-ARCH-39.0 - ASA-VALIDATION Validator / Establishment Builder (Draft 0.4)
 *
 * Establishes the immutable ASA-VALIDATION Extension Validation & Assurance Layer.
 * Consumes frozen ASA-ARCH-35.1 Extension Development Framework by reference.
 * Does NOT mutate Core, Governance, Framework, OPS, CONNECT, or AI contracts.
 *
 * Performs structural validation only — not a validation / discovery engine.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import {
    freezeAssuranceEvidenceContract,
    type AssuranceEvidenceContract,
    type AssuranceEvidenceField,
} from "./AssuranceEvidenceContract";
import {
    AsaValidationLayer,
    type AsaValidationLayerMetadata,
    type ValidationLayerSecurityBoundary,
    type ValidationSiblingIndependence,
} from "./AsaValidationLayer";
import {
    freezeFindingContract,
    freezeRiskAssessmentBoundary,
    type FindingContract,
    type FindingField,
    type FindingSeverity,
    type FindingStatus,
    type RiskAssessmentBoundary,
} from "./FindingContract";
import {
    freezeAiOutputValidationBoundary,
    freezeCertificationBoundary,
    freezeChangeImpactAnalysisContract,
    freezeComplianceContract,
    freezeRegressionAssuranceContract,
    freezeSelfValidationRestriction,
    freezeValidationInputBoundary,
    freezeValidationMemoryBoundary,
    freezeValidationObservationBoundary,
    freezeValidationOutputBoundary,
    type AiOutputValidationBoundary,
    type CertificationBoundary,
    type ChangeImpactAnalysisContract,
    type ComplianceContract,
    type ComplianceTargetKind,
    type RegressionAssuranceContract,
    type SelfValidationRestriction,
    type ValidationInputBoundary,
    type ValidationInputKind,
    type ValidationMemoryBoundary,
    type ValidationObservationBoundary,
    type ValidationOutputBoundary,
    type ValidationOutputKind,
} from "./ValidationBoundaryContract";
import {
    freezeValidationContract,
    freezeValidationProviderRole,
    type ValidationContract,
    type ValidationOperation,
    type ValidationProviderRole,
} from "./ValidationContract";
import {
    freezeValidationExtensionContract,
    type ValidationExtensionContract,
} from "./ValidationExtensionContract";
import {
    freezeValidationLifecycleContract,
    freezeValidatorDiscoveryContract,
    freezeValidatorFallbackStrategyContract,
    freezeValidatorRegistrationContract,
    freezeValidatorSelectionContract,
    type ValidationLifecycleContract,
    type ValidationProviderLifecycleState,
    type ValidatorDiscoveryContract,
    type ValidatorFallbackStrategyContract,
    type ValidatorRegistrationContract,
    type ValidatorSelectionContract,
} from "./ValidationProviderRegistration";
import {
    freezeValidationConfidenceContract,
    freezeValidationResultContract,
    type ValidationConfidenceContract,
    type ValidationResultContract,
    type ValidationResultField,
    type ValidationResultStatus,
    type ValidationRiskLevel,
    type ValidationTargetType,
} from "./ValidationResultContract";
import {
    freezeValidationAuditCompatibilityContract,
    freezeValidationDeterminismPolicy,
    freezeValidationSecurityContract,
    type ValidationAuditCompatibilityContract,
    type ValidationDeterminismPolicy,
    type ValidationSecurityContract,
    type ValidationSecurityForbidKind,
} from "./ValidationSecurityContract";

const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const REQUIRED_FRAMEWORK_ARCH = "ASA-ARCH-35.1";

const REQUIRED_OPS: ReadonlyArray<ValidationOperation> = [
    "validate",
    "verify",
    "compare",
    "assess",
    "report",
    "generateCertificationResult",
];
const REQUIRED_RESULT_FIELDS: ReadonlyArray<ValidationResultField> = [
    "id",
    "target",
    "targetType",
    "scope",
    "status",
    "checks",
    "findings",
    "evidence",
    "riskLevel",
    "confidence",
    "validatorVersion",
    "ruleVersion",
    "timestamp",
];
const REQUIRED_TARGET_TYPES: ReadonlyArray<ValidationTargetType> = [
    "Architecture",
    "Extension",
    "Contract",
    "Provider",
    "Configuration",
    "ExecutionRecord",
];
const REQUIRED_STATUSES: ReadonlyArray<ValidationResultStatus> = [
    "PASS",
    "WARN",
    "FAIL",
    "UNKNOWN",
];
const REQUIRED_RISK_LEVELS: ReadonlyArray<ValidationRiskLevel> = [
    "NONE",
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];
const REQUIRED_CONFIDENCE_FIELDS = [
    "value",
    "reason",
    "calculationMethod",
] as const;
const REQUIRED_FINDING_FIELDS: ReadonlyArray<FindingField> = [
    "id",
    "category",
    "description",
    "severity",
    "evidence",
    "recommendation",
    "status",
    "timestamp",
];
const REQUIRED_SEVERITIES: ReadonlyArray<FindingSeverity> = [
    "INFO",
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];
const REQUIRED_FINDING_STATUSES: ReadonlyArray<FindingStatus> = [
    "OPEN",
    "ACKNOWLEDGED",
    "RESOLVED",
    "IGNORED",
];
const REQUIRED_EVIDENCE_FIELDS: ReadonlyArray<AssuranceEvidenceField> = [
    "source",
    "reference",
    "timestamp",
    "integrityHash",
    "verificationMethod",
];
const REQUIRED_INPUTS: ReadonlyArray<ValidationInputKind> = [
    "ARCHITECTURE_SPECIFICATION",
    "EXTENSION_METADATA",
    "CONTRACT_DEFINITION",
    "REGISTRATION_DATA",
    "VERIFICATION_DATA",
    "TEST_RESULT",
    "AUDIT_RECORD",
    "OPS_OBSERVATION_DATA",
    "EXTERNAL_EVIDENCE_CONNECT",
];
const REQUIRED_OUTPUTS: ReadonlyArray<ValidationOutputKind> = [
    "VALIDATION_RESULT",
    "COMPLIANCE_REPORT",
    "FINDING",
    "RISK_ASSESSMENT",
    "ASSURANCE_CERTIFICATION_RESULT",
    "REMEDIATION_RECOMMENDATION",
];
const REQUIRED_COMPLIANCE: ReadonlyArray<ComplianceTargetKind> = [
    "ArchitectureCompliance",
    "AuthorityCompliance",
    "ContractCompliance",
    "SecurityCompliance",
    "LifecycleCompliance",
    "RegressionCompliance",
    "ExtensionCompliance",
];
const REQUIRED_SECURITY: ReadonlyArray<ValidationSecurityForbidKind> = [
    "ModifySecurityPolicy",
    "GrantPrivileges",
    "BypassAuthentication",
    "SuppressFindings",
    "HideFailures",
    "ManipulateValidationResult",
    "ForgeEvidence",
    "AlterAuditRecord",
];
const REQUIRED_DETERMINISM = [
    "validatorVersion",
    "ruleVersion",
    "environmentVersion",
    "configurationVersion",
    "evidenceVersion",
    "timestamp",
] as const;
const REQUIRED_REG_FIELDS = [
    "metadata",
    "authority",
    "capabilities",
    "version",
    "validationScope",
    "securityProfile",
    "ruleVersion",
    "validationModel",
] as const;
const REQUIRED_FALLBACK = [
    "fallbackValidator",
    "manualValidationMode",
    "validationConfidence",
] as const;
const REQUIRED_LIFECYCLE: ReadonlyArray<ValidationProviderLifecycleState> = [
    "Created",
    "Initialized",
    "Active",
    "Failed",
    "Suspended",
    "Reinitialized",
    "Terminated",
];

/**
 * Structural validator that establishes the ASA-VALIDATION layer.
 */
export class ValidationValidator {
    private layerId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceFramework: ExtensionDevelopmentFramework | undefined;
    private extensionContract: ValidationExtensionContract | undefined;
    private validationContract: ValidationContract | undefined;
    private providerRole: ValidationProviderRole | undefined;
    private resultContract: ValidationResultContract | undefined;
    private confidenceContract: ValidationConfidenceContract | undefined;
    private findingContract: FindingContract | undefined;
    private riskAssessmentBoundary: RiskAssessmentBoundary | undefined;
    private evidenceContract: AssuranceEvidenceContract | undefined;
    private inputBoundary: ValidationInputBoundary | undefined;
    private outputBoundary: ValidationOutputBoundary | undefined;
    private memoryBoundary: ValidationMemoryBoundary | undefined;
    private observationBoundary: ValidationObservationBoundary | undefined;
    private certificationBoundary: CertificationBoundary | undefined;
    private selfValidationRestriction: SelfValidationRestriction | undefined;
    private aiOutputValidationBoundary: AiOutputValidationBoundary | undefined;
    private complianceContract: ComplianceContract | undefined;
    private changeImpactAnalysis: ChangeImpactAnalysisContract | undefined;
    private regressionAssurance: RegressionAssuranceContract | undefined;
    private securityContract: ValidationSecurityContract | undefined;
    private auditCompatibility: ValidationAuditCompatibilityContract | undefined;
    private determinismPolicy: ValidationDeterminismPolicy | undefined;
    private validatorRegistration: ValidatorRegistrationContract | undefined;
    private validatorDiscovery: ValidatorDiscoveryContract | undefined;
    private validatorSelection: ValidatorSelectionContract | undefined;
    private fallbackStrategy: ValidatorFallbackStrategyContract | undefined;
    private lifecycleContract: ValidationLifecycleContract | undefined;

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
    withExtensionContract(extensionContract: ValidationExtensionContract): this {
        this.extensionContract = extensionContract;
        return this;
    }
    withValidationContract(validationContract: ValidationContract): this {
        this.validationContract = validationContract;
        return this;
    }
    withProviderRole(providerRole: ValidationProviderRole): this {
        this.providerRole = providerRole;
        return this;
    }
    withResultContract(resultContract: ValidationResultContract): this {
        this.resultContract = resultContract;
        return this;
    }
    withConfidenceContract(
        confidenceContract: ValidationConfidenceContract
    ): this {
        this.confidenceContract = confidenceContract;
        return this;
    }
    withFindingContract(findingContract: FindingContract): this {
        this.findingContract = findingContract;
        return this;
    }
    withRiskAssessmentBoundary(
        riskAssessmentBoundary: RiskAssessmentBoundary
    ): this {
        this.riskAssessmentBoundary = riskAssessmentBoundary;
        return this;
    }
    withEvidenceContract(evidenceContract: AssuranceEvidenceContract): this {
        this.evidenceContract = evidenceContract;
        return this;
    }
    withInputBoundary(inputBoundary: ValidationInputBoundary): this {
        this.inputBoundary = inputBoundary;
        return this;
    }
    withOutputBoundary(outputBoundary: ValidationOutputBoundary): this {
        this.outputBoundary = outputBoundary;
        return this;
    }
    withMemoryBoundary(memoryBoundary: ValidationMemoryBoundary): this {
        this.memoryBoundary = memoryBoundary;
        return this;
    }
    withObservationBoundary(
        observationBoundary: ValidationObservationBoundary
    ): this {
        this.observationBoundary = observationBoundary;
        return this;
    }
    withCertificationBoundary(
        certificationBoundary: CertificationBoundary
    ): this {
        this.certificationBoundary = certificationBoundary;
        return this;
    }
    withSelfValidationRestriction(
        selfValidationRestriction: SelfValidationRestriction
    ): this {
        this.selfValidationRestriction = selfValidationRestriction;
        return this;
    }
    withAiOutputValidationBoundary(
        aiOutputValidationBoundary: AiOutputValidationBoundary
    ): this {
        this.aiOutputValidationBoundary = aiOutputValidationBoundary;
        return this;
    }
    withComplianceContract(complianceContract: ComplianceContract): this {
        this.complianceContract = complianceContract;
        return this;
    }
    withChangeImpactAnalysis(
        changeImpactAnalysis: ChangeImpactAnalysisContract
    ): this {
        this.changeImpactAnalysis = changeImpactAnalysis;
        return this;
    }
    withRegressionAssurance(
        regressionAssurance: RegressionAssuranceContract
    ): this {
        this.regressionAssurance = regressionAssurance;
        return this;
    }
    withSecurityContract(securityContract: ValidationSecurityContract): this {
        this.securityContract = securityContract;
        return this;
    }
    withAuditCompatibility(
        auditCompatibility: ValidationAuditCompatibilityContract
    ): this {
        this.auditCompatibility = auditCompatibility;
        return this;
    }
    withDeterminismPolicy(determinismPolicy: ValidationDeterminismPolicy): this {
        this.determinismPolicy = determinismPolicy;
        return this;
    }
    withValidatorRegistration(
        validatorRegistration: ValidatorRegistrationContract
    ): this {
        this.validatorRegistration = validatorRegistration;
        return this;
    }
    withValidatorDiscovery(
        validatorDiscovery: ValidatorDiscoveryContract
    ): this {
        this.validatorDiscovery = validatorDiscovery;
        return this;
    }
    withValidatorSelection(
        validatorSelection: ValidatorSelectionContract
    ): this {
        this.validatorSelection = validatorSelection;
        return this;
    }
    withFallbackStrategy(
        fallbackStrategy: ValidatorFallbackStrategyContract
    ): this {
        this.fallbackStrategy = fallbackStrategy;
        return this;
    }
    withLifecycleContract(lifecycleContract: ValidationLifecycleContract): this {
        this.lifecycleContract = lifecycleContract;
        return this;
    }

    /**
     * Establishes the immutable ASA-VALIDATION layer after structural validation.
     */
    establish(): AsaValidationLayer {
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
                "ASA-VALIDATION establishment failed: exactly one source Extension Development Framework is required"
            );
        }
        const framework = this.sourceFramework;
        if (!Object.isFrozen(framework) || !Object.isFrozen(framework.identity)) {
            throw new Error(
                "ASA-VALIDATION establishment failed: source Framework immutability verification failed"
            );
        }
        if (framework.identity.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Framework must preserve ASA-CORE-34.0"
            );
        }
        if (
            framework.identity.architectureVersion !== REQUIRED_FRAMEWORK_ARCH &&
            framework.metadata.architectureVersion !== REQUIRED_FRAMEWORK_ARCH
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Framework must be ASA-ARCH-35.1"
            );
        }
        if (framework.metadata.frameworkStatus !== "defined") {
            throw new Error(
                "ASA-VALIDATION establishment failed: Framework status must be defined"
            );
        }

        this.requirePresent(this.extensionContract, "ValidationExtensionContract");
        this.requirePresent(this.validationContract, "ValidationContract");
        this.requirePresent(this.providerRole, "ValidationProviderRole");
        this.requirePresent(this.resultContract, "ValidationResultContract");
        this.requirePresent(
            this.confidenceContract,
            "ValidationConfidenceContract"
        );
        this.requirePresent(this.findingContract, "FindingContract");
        this.requirePresent(
            this.riskAssessmentBoundary,
            "RiskAssessmentBoundary"
        );
        this.requirePresent(this.evidenceContract, "AssuranceEvidenceContract");
        this.requirePresent(this.inputBoundary, "ValidationInputBoundary");
        this.requirePresent(this.outputBoundary, "ValidationOutputBoundary");
        this.requirePresent(this.memoryBoundary, "ValidationMemoryBoundary");
        this.requirePresent(
            this.observationBoundary,
            "ValidationObservationBoundary"
        );
        this.requirePresent(
            this.certificationBoundary,
            "CertificationBoundary"
        );
        this.requirePresent(
            this.selfValidationRestriction,
            "SelfValidationRestriction"
        );
        this.requirePresent(
            this.aiOutputValidationBoundary,
            "AiOutputValidationBoundary"
        );
        this.requirePresent(this.complianceContract, "ComplianceContract");
        this.requirePresent(
            this.changeImpactAnalysis,
            "ChangeImpactAnalysisContract"
        );
        this.requirePresent(
            this.regressionAssurance,
            "RegressionAssuranceContract"
        );
        this.requirePresent(this.securityContract, "ValidationSecurityContract");
        this.requirePresent(
            this.auditCompatibility,
            "ValidationAuditCompatibilityContract"
        );
        this.requirePresent(
            this.determinismPolicy,
            "ValidationDeterminismPolicy"
        );
        this.requirePresent(
            this.validatorRegistration,
            "ValidatorRegistrationContract"
        );
        this.requirePresent(
            this.validatorDiscovery,
            "ValidatorDiscoveryContract"
        );
        this.requirePresent(
            this.validatorSelection,
            "ValidatorSelectionContract"
        );
        this.requirePresent(
            this.fallbackStrategy,
            "ValidatorFallbackStrategyContract"
        );
        this.requirePresent(this.lifecycleContract, "ValidationLifecycleContract");

        this.validateExtension(this.extensionContract!);
        this.validateValidationContract(this.validationContract!);
        this.validateProviderRole(this.providerRole!);
        this.validateResult(this.resultContract!);
        this.validateConfidence(this.confidenceContract!);
        this.validateFinding(this.findingContract!);
        this.validateRisk(this.riskAssessmentBoundary!);
        this.validateEvidence(this.evidenceContract!);
        this.validateInput(this.inputBoundary!);
        this.validateOutput(this.outputBoundary!);
        this.validateMemory(this.memoryBoundary!);
        this.validateObservation(this.observationBoundary!);
        this.validateCertification(this.certificationBoundary!);
        this.validateSelfRestriction(this.selfValidationRestriction!);
        this.validateAiOutput(this.aiOutputValidationBoundary!);
        this.validateCompliance(this.complianceContract!);
        this.validateChangeImpact(this.changeImpactAnalysis!);
        this.validateRegression(this.regressionAssurance!);
        this.validateSecurity(this.securityContract!);
        this.validateAuditCompat(this.auditCompatibility!);
        this.validateDeterminism(this.determinismPolicy!);
        this.validateRegistration(this.validatorRegistration!);
        this.validateDiscovery(this.validatorDiscovery!);
        this.validateSelection(this.validatorSelection!);
        this.validateFallback(this.fallbackStrategy!);
        this.validateLifecycle(this.lifecycleContract!);

        const securityBoundary: ValidationLayerSecurityBoundary = Object.freeze({
            holdsDecisionAuthority: false as const,
            holdsExecutionAuthority: false as const,
            holdsPolicyAuthority: false as const,
            holdsValidatorResponsibility: true as const,
            forbidsAuthorityEscalation: true as const,
        });
        const siblingIndependence: ValidationSiblingIndependence = Object.freeze({
            peerToOps: true as const,
            peerToConnect: true as const,
            peerToAi: true as const,
            forbidsOpsDependencyOwnership: true as const,
            forbidsConnectDependencyOwnership: true as const,
            forbidsAiDependencyOwnership: true as const,
            forbidsCoreIntrusion: true as const,
        });
        const metadata: AsaValidationLayerMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesGovernanceContract: true as const,
            preservesFrameworkContract: true as const,
            preservesOpsContract: true as const,
            preservesConnectContract: true as const,
            preservesAiContract: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new AsaValidationLayer({
            identity: Object.freeze({
                layerId,
                extensionId: "ASA-VALIDATION" as const,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
                sourceFrameworkId: framework.identity.frameworkId,
            }),
            metadata,
            sourceFramework: framework,
            extensionContract: freezeValidationExtensionContract(
                this.extensionContract!
            ),
            validationContract: freezeValidationContract(
                this.validationContract!
            ),
            providerRole: freezeValidationProviderRole(this.providerRole!),
            resultContract: freezeValidationResultContract(this.resultContract!),
            confidenceContract: freezeValidationConfidenceContract(
                this.confidenceContract!
            ),
            findingContract: freezeFindingContract(this.findingContract!),
            riskAssessmentBoundary: freezeRiskAssessmentBoundary(
                this.riskAssessmentBoundary!
            ),
            evidenceContract: freezeAssuranceEvidenceContract(
                this.evidenceContract!
            ),
            inputBoundary: freezeValidationInputBoundary(this.inputBoundary!),
            outputBoundary: freezeValidationOutputBoundary(this.outputBoundary!),
            memoryBoundary: freezeValidationMemoryBoundary(this.memoryBoundary!),
            observationBoundary: freezeValidationObservationBoundary(
                this.observationBoundary!
            ),
            certificationBoundary: freezeCertificationBoundary(
                this.certificationBoundary!
            ),
            selfValidationRestriction: freezeSelfValidationRestriction(
                this.selfValidationRestriction!
            ),
            aiOutputValidationBoundary: freezeAiOutputValidationBoundary(
                this.aiOutputValidationBoundary!
            ),
            complianceContract: freezeComplianceContract(
                this.complianceContract!
            ),
            changeImpactAnalysis: freezeChangeImpactAnalysisContract(
                this.changeImpactAnalysis!
            ),
            regressionAssurance: freezeRegressionAssuranceContract(
                this.regressionAssurance!
            ),
            securityContract: freezeValidationSecurityContract(
                this.securityContract!
            ),
            auditCompatibility: freezeValidationAuditCompatibilityContract(
                this.auditCompatibility!
            ),
            determinismPolicy: freezeValidationDeterminismPolicy(
                this.determinismPolicy!
            ),
            validatorRegistration: freezeValidatorRegistrationContract(
                this.validatorRegistration!
            ),
            validatorDiscovery: freezeValidatorDiscoveryContract(
                this.validatorDiscovery!
            ),
            validatorSelection: freezeValidatorSelectionContract(
                this.validatorSelection!
            ),
            fallbackStrategy: freezeValidatorFallbackStrategyContract(
                this.fallbackStrategy!
            ),
            lifecycleContract: freezeValidationLifecycleContract(
                this.lifecycleContract!
            ),
            securityBoundary,
            siblingIndependence,
        });
    }

    private validateExtension(c: ValidationExtensionContract): void {
        if (c.id !== "ASA-VALIDATION") {
            throw new Error(
                "ASA-VALIDATION establishment failed: Extension Identifier must be ASA-VALIDATION"
            );
        }
        this.requireNonEmpty(c.version, "extensionContract.version");
        if (c.domain !== "Assurance" || c.frameworkDomain !== "VALIDATION") {
            throw new Error(
                "ASA-VALIDATION establishment failed: domain/frameworkDomain must be Assurance/VALIDATION"
            );
        }
        if (c.authority !== "VALIDATOR") {
            throw new Error(
                "ASA-VALIDATION establishment failed: Authority Declaration must be VALIDATOR"
            );
        }
        this.requireNonEmpty(c.description, "extensionContract.description");
        this.requireNonEmpty(
            c.governanceOwner,
            "extensionContract.governanceOwner"
        );
        if (
            !c.compatibility.includes(REQUIRED_CORE_VERSION) ||
            !c.compatibility.includes("ASA-ARCH-35.x") ||
            !c.compatibility.includes("ASA-ARCH-35.1") ||
            !c.compatibility.includes("ASA-ARCH-36.0") ||
            !c.compatibility.includes("ASA-ARCH-37.0") ||
            !c.compatibility.includes("ASA-ARCH-38.0")
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: compatibility must include ASA-CORE-34.0, ASA-ARCH-35.x, ASA-ARCH-35.1, ASA-ARCH-36.0, ASA-ARCH-37.0, ASA-ARCH-38.0"
            );
        }
        if (
            c.forbidsExecute !== true ||
            c.forbidsAuthorityEscalation !== true ||
            c.forbidsCoreMutation !== true ||
            c.forbidsFrameworkMutation !== true ||
            c.forbidsGovernanceMutation !== true ||
            c.forbidsAutomaticCorrection !== true ||
            c.certificationIsNotExecution !== true ||
            c.validationIsNotAuthority !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Authority Isolation flags invalid"
            );
        }
        if (
            c.permitsObserve !== true ||
            c.permitsInspect !== true ||
            c.permitsValidate !== true ||
            c.permitsCompare !== true ||
            c.permitsAnalyze !== true ||
            c.permitsGenerateReport !== true ||
            c.permitsGenerateFinding !== true ||
            c.permitsGenerateAssuranceCertificationResult !== true ||
            c.permitsRequestReview !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: VALIDATOR permitted operations must all be true"
            );
        }
    }

    private validateValidationContract(c: ValidationContract): void {
        this.requireNonEmpty(c.contractId, "validationContract.contractId");
        this.requireAllPresent(c.operations, REQUIRED_OPS, "Validation operations");
        if (
            c.technologyIndependent !== true ||
            c.forbidsVendorCoupling !== true ||
            c.forbidsAutonomousExecution !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Validation Contract flags invalid"
            );
        }
    }

    private validateProviderRole(c: ValidationProviderRole): void {
        this.requireNonEmpty(c.roleId, "providerRole.roleId");
        if (c.isNotExecutionProvider !== true) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Provider must not be Execution Provider"
            );
        }
    }

    private validateResult(c: ValidationResultContract): void {
        this.requireNonEmpty(c.resultContractId, "resultContract.resultContractId");
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_RESULT_FIELDS,
            "Result fields"
        );
        this.requireAllPresent(
            c.allowedTargetTypes,
            REQUIRED_TARGET_TYPES,
            "Target types"
        );
        this.requireAllPresent(c.allowedStatuses, REQUIRED_STATUSES, "Statuses");
        this.requireAllPresent(
            c.allowedRiskLevels,
            REQUIRED_RISK_LEVELS,
            "Risk levels"
        );
        if (
            c.riskLevelIsAssessmentOnly !== true ||
            c.riskLevelDoesNotAuthorizeAction !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Risk Level Boundary invalid"
            );
        }
    }

    private validateConfidence(c: ValidationConfidenceContract): void {
        this.requireNonEmpty(
            c.confidenceContractId,
            "confidenceContract.confidenceContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_CONFIDENCE_FIELDS,
            "Confidence fields"
        );
        if (
            c.valueRange !== "0.0_TO_1.0" ||
            c.confidenceIsNotApproval !== true ||
            c.confidenceIsNotExecutionPermission !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Confidence Boundary invalid"
            );
        }
    }

    private validateFinding(c: FindingContract): void {
        this.requireNonEmpty(c.findingContractId, "findingContract.findingContractId");
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_FINDING_FIELDS,
            "Finding fields"
        );
        this.requireAllPresent(
            c.allowedSeverities,
            REQUIRED_SEVERITIES,
            "Severities"
        );
        this.requireAllPresent(
            c.allowedStatuses,
            REQUIRED_FINDING_STATUSES,
            "Finding statuses"
        );
        if (c.recommendationIsNotCorrection !== true) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Finding recommendation must not be correction"
            );
        }
    }

    private validateRisk(c: RiskAssessmentBoundary): void {
        this.requireNonEmpty(c.boundaryId, "riskAssessmentBoundary.boundaryId");
        if (
            c.riskLevelDoesNotAuthorizeAction !== true ||
            c.riskLevelIsAssessmentInformationOnly !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Risk Assessment Boundary invalid"
            );
        }
    }

    private validateEvidence(c: AssuranceEvidenceContract): void {
        this.requireNonEmpty(
            c.evidenceContractId,
            "evidenceContract.evidenceContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_EVIDENCE_FIELDS,
            "Evidence fields"
        );
        if (
            c.forbidsFabricationByValidator !== true ||
            c.evidenceOriginMustBePreserved !== true ||
            c.evidenceMustRemainTraceable !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Evidence Integrity flags invalid"
            );
        }
    }

    private validateInput(c: ValidationInputBoundary): void {
        this.requireNonEmpty(c.boundaryId, "inputBoundary.boundaryId");
        this.requireAllPresent(c.allowedInputs, REQUIRED_INPUTS, "Inputs");
        if (
            c.inputIsReadOnly !== true ||
            c.forbidsDirectRuntimeStateAccess !== true ||
            c.forbidsBypassObservationBoundary !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Input / Observation Boundary invalid"
            );
        }
    }

    private validateOutput(c: ValidationOutputBoundary): void {
        this.requireNonEmpty(c.boundaryId, "outputBoundary.boundaryId");
        this.requireAllPresent(c.allowedOutputs, REQUIRED_OUTPUTS, "Outputs");
        if (
            c.forbidsExecutionCommand !== true ||
            c.forbidsAutomaticCorrection !== true ||
            c.recommendationIsNotCorrection !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Output Boundary invalid"
            );
        }
    }

    private validateMemory(c: ValidationMemoryBoundary): void {
        this.requireNonEmpty(c.boundaryId, "memoryBoundary.boundaryId");
        if (
            c.historyIsNotCoreState !== true ||
            c.recordsAreAssuranceOnly !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Memory Boundary invalid"
            );
        }
    }

    private validateObservation(c: ValidationObservationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "observationBoundary.boundaryId");
        if (
            c.consumesExtensionRegistryMetadataOnly !== true ||
            c.registryIsNotExecutionAuthority !== true ||
            c.forbidsInspectExtensionInternalsViaRegistry !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Observation Boundary invalid"
            );
        }
    }

    private validateCertification(c: CertificationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "certificationBoundary.boundaryId");
        if (
            c.certificationIsNotExecutionPermission !== true ||
            c.certificationIsNotAuthorityGrant !== true ||
            c.certificationIsAssessmentResultOnly !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Certification Boundary invalid"
            );
        }
    }

    private validateSelfRestriction(c: SelfValidationRestriction): void {
        this.requireNonEmpty(c.restrictionId, "selfValidationRestriction.restrictionId");
        if (
            c.forbidsCertifyOwnImplementationIntegrity !== true ||
            c.forbidsCertifyOwnAuthorityBoundary !== true ||
            c.forbidsCertifyOwnSecurityCompliance !== true ||
            c.requiresIndependentValidation !== true ||
            c.independentAuthorityExternalToInstance !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Self Validation Restriction invalid"
            );
        }
    }

    private validateAiOutput(c: AiOutputValidationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "aiOutputValidationBoundary.boundaryId");
        if (
            c.aiOutputValidationIsNotAiAuthority !== true ||
            c.forbidsModifyAiDecisions !== true ||
            c.forbidsBecomeAiAuthority !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: AI Output Validation Boundary invalid"
            );
        }
    }

    private validateCompliance(c: ComplianceContract): void {
        this.requireNonEmpty(
            c.complianceContractId,
            "complianceContract.complianceContractId"
        );
        this.requireAllPresent(c.targets, REQUIRED_COMPLIANCE, "Compliance targets");
    }

    private validateChangeImpact(c: ChangeImpactAnalysisContract): void {
        this.requireNonEmpty(
            c.analysisContractId,
            "changeImpactAnalysis.analysisContractId"
        );
        if (c.doesNotApproveChanges !== true) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Change Impact must not approve changes"
            );
        }
    }

    private validateRegression(c: RegressionAssuranceContract): void {
        this.requireNonEmpty(
            c.regressionContractId,
            "regressionAssurance.regressionContractId"
        );
        if (c.frozenArchitectureRemainsImmutable !== true) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Regression must preserve frozen architecture"
            );
        }
    }

    private validateSecurity(c: ValidationSecurityContract): void {
        this.requireNonEmpty(
            c.securityContractId,
            "securityContract.securityContractId"
        );
        this.requireAllPresent(
            c.forbiddenBehaviors,
            REQUIRED_SECURITY,
            "Security forbids"
        );
        if (
            c.forbidsForgeEvidence !== true ||
            c.forbidsManipulateValidationResult !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Security Compliance flags invalid"
            );
        }
    }

    private validateAuditCompat(c: ValidationAuditCompatibilityContract): void {
        this.requireNonEmpty(
            c.auditCompatibilityId,
            "auditCompatibility.auditCompatibilityId"
        );
        if (
            c.compatibleWithOpsReadOnly !== true ||
            c.compatibleWithConnectReadOnly !== true ||
            c.compatibleWithAiReadOnly !== true ||
            c.integrationIsReadOnly !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Audit Compatibility invalid"
            );
        }
    }

    private validateDeterminism(c: ValidationDeterminismPolicy): void {
        this.requireNonEmpty(c.policyId, "determinismPolicy.policyId");
        this.requireAllPresent(
            c.requiredMetadata,
            REQUIRED_DETERMINISM,
            "Determinism metadata"
        );
    }

    private validateRegistration(c: ValidatorRegistrationContract): void {
        this.requireNonEmpty(
            c.registrationContractId,
            "validatorRegistration.registrationContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_REG_FIELDS,
            "Registration fields"
        );
        if (c.authorityMustBeValidator !== true) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Registration authority must be VALIDATOR"
            );
        }
    }

    private validateDiscovery(c: ValidatorDiscoveryContract): void {
        this.requireNonEmpty(
            c.discoveryContractId,
            "validatorDiscovery.discoveryContractId"
        );
        if (
            c.isNotRuntimeDiscoveryEngine !== true ||
            c.registryIsNotExecutionAuthority !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Validator Discovery Contract invalid"
            );
        }
    }

    private validateSelection(c: ValidatorSelectionContract): void {
        this.requireNonEmpty(
            c.selectionContractId,
            "validatorSelection.selectionContractId"
        );
        if (
            c.isNotRuntimeSelectionEngine !== true ||
            c.forbidsAutonomousExecution !== true ||
            c.forbidsAuthorityEscalation !== true
        ) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Validator Selection Contract invalid"
            );
        }
    }

    private validateFallback(c: ValidatorFallbackStrategyContract): void {
        this.requireNonEmpty(
            c.fallbackContractId,
            "fallbackStrategy.fallbackContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_FALLBACK,
            "Fallback fields"
        );
        if (c.manualModePreservesHumanAuthority !== true) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Fallback must preserve Human Authority"
            );
        }
    }

    private validateLifecycle(c: ValidationLifecycleContract): void {
        this.requireNonEmpty(
            c.lifecycleContractId,
            "lifecycleContract.lifecycleContractId"
        );
        this.requireOrdered(
            c.allowedStates,
            REQUIRED_LIFECYCLE,
            "Lifecycle states"
        );
        if (c.transitionsMustBeExplicit !== true) {
            throw new Error(
                "ASA-VALIDATION establishment failed: Lifecycle transitions must be explicit"
            );
        }
    }

    private requirePresent<T>(
        value: T | undefined,
        label: string
    ): asserts value is T {
        if (value === undefined) {
            throw new Error(
                `ASA-VALIDATION establishment failed: ${label} is required`
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
                    `ASA-VALIDATION establishment failed: ${label} missing ${item}`
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
                `ASA-VALIDATION establishment failed: ${label} incomplete or out of order`
            );
        }
    }

    private requireNonEmpty(value: string | undefined, field: string): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ASA-VALIDATION establishment failed: ${field} is required`
            );
        }
        return value;
    }
}
