import { ExtensionGovernanceBuilder } from "../../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFrameworkBuilder } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";
import type { AssuranceEvidenceContract } from "../../../src/extensions/asa_validation/AssuranceEvidenceContract";
import type {
    FindingContract,
    RiskAssessmentBoundary,
} from "../../../src/extensions/asa_validation/FindingContract";
import type {
    AiOutputValidationBoundary,
    CertificationBoundary,
    ChangeImpactAnalysisContract,
    ComplianceContract,
    RegressionAssuranceContract,
    SelfValidationRestriction,
    ValidationInputBoundary,
    ValidationMemoryBoundary,
    ValidationObservationBoundary,
    ValidationOutputBoundary,
} from "../../../src/extensions/asa_validation/ValidationBoundaryContract";
import type {
    ValidationContract,
    ValidationProviderRole,
} from "../../../src/extensions/asa_validation/ValidationContract";
import type { ValidationExtensionContract } from "../../../src/extensions/asa_validation/ValidationExtensionContract";
import type {
    ValidationLifecycleContract,
    ValidatorDiscoveryContract,
    ValidatorFallbackStrategyContract,
    ValidatorRegistrationContract,
    ValidatorSelectionContract,
} from "../../../src/extensions/asa_validation/ValidationProviderRegistration";
import type {
    ValidationConfidenceContract,
    ValidationResultContract,
} from "../../../src/extensions/asa_validation/ValidationResultContract";
import type {
    ValidationAuditCompatibilityContract,
    ValidationDeterminismPolicy,
    ValidationSecurityContract,
} from "../../../src/extensions/asa_validation/ValidationSecurityContract";
import { ValidationValidator } from "../../../src/extensions/asa_validation/ValidationValidator";

function sampleBoundaryContract(): ExtensionBoundaryContract {
    return Object.freeze({
        contractId: "ext.boundary.contract.v1",
        coreVersion: "ASA-CORE-34.0",
        architectureVersion: "ASA-ARCH-35.0",
        structuralVersion: "0.3",
        isolation: true as const,
        permittedOperationIds: Object.freeze([
            "observe",
            "inspect",
            "validate",
            "compare",
            "analyze",
            "generate.report",
            "generate.finding",
            "generate.assurance.certification.result",
            "request.review",
        ]),
        forbidsDirectCoreMutation: true as const,
        forbidsAdministratorAuthority: true as const,
    });
}

function sampleDescriptors(): ExtensionDescriptor[] {
    return [
        Object.freeze({
            id: "ASA-OPS",
            version: "1.0.0",
            domain: "OPS" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze([
                    "ASA-AI",
                    "ASA-CONNECT",
                ]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "OBSERVER" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
        Object.freeze({
            id: "ASA-AI",
            version: "1.0.0",
            domain: "AI" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze(["ASA-OPS"]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "ADVISOR" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
    ];
}

function sampleMatrix(): ExtensionCompatibilityMatrixEntry[] {
    return [
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-OPS",
            extensionVersionRange: "1.x",
            contractVersion: "1.0.0",
        }),
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-AI",
            extensionVersionRange: "1.x",
            contractVersion: "1.0.0",
        }),
    ];
}

function sampleRegression(): ExtensionRegressionBoundary {
    return Object.freeze({
        coreRegressionRequired: true as const,
        extensionRegressionRequired: true as const,
        integrationRegressionRequired: true as const,
        isolationRegressionRequired: true as const,
    });
}

function establishGovernance() {
    return new ExtensionGovernanceBuilder()
        .withGovernanceLayerId("egl-validation")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression())
        .establish();
}

/**
 * Framework template uses frozen ExtensionDomainKind (OPS|AI|CONNECT)
 * and ExtensionAuthorityLevel ranks. VALIDATOR / VALIDATION are declared
 * on ValidationExtensionContract (local to ASA-ARCH-39.0).
 */
function sampleFrameworkTemplate(): ExtensionTemplateContract {
    return Object.freeze({
        metadata: Object.freeze({
            id: "ASA-VALIDATION",
            version: "1.0.0",
            domain: "OPS" as const,
            description:
                "Validation development template host for ASA-ARCH-39.0 (Framework domain constrained to OPS|AI|CONNECT)",
            governanceOwner: "ASA-GOV-VALIDATION",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.validation.input.v1"]),
            processingBoundaryId: "ext.validation.processing.v1",
            outputContractIds: Object.freeze(["ext.validation.output.v1"]),
            errorContract: Object.freeze({
                errorType: "VALIDATION_FAILURE",
                failureState: "FAILED",
                recoveryPolicy: "HALT",
                notificationPolicy: "GOVERNANCE_NOTIFY",
            }),
            forbidsCoreMutation: true as const,
            forbidsGovernanceMutation: true as const,
        }),
        authority: Object.freeze({
            declaredAuthority: "OBSERVER" as const,
            approvedAuthority: "OBSERVER" as const,
            forbidsRuntimeEscalation: true as const,
        }),
        lifecycle: "VALIDATED" as const,
        dependency: Object.freeze([] as string[]),
        compatibility: Object.freeze({
            compatibleCore: "ASA-CORE-34.0" as const,
            compatibleGovernance: "ASA-ARCH-35.x",
            requiresVersionMatch: true as const,
            requiresContractMatch: true as const,
            requiresRuntimeValidation: true as const,
            requiresRegressionPass: true as const,
        }),
        validation: Object.freeze({
            stages: Object.freeze([
                "PROPOSAL",
                "CONTRACT_VALIDATION",
                "AUTHORITY_VALIDATION",
                "COMPATIBILITY_VALIDATION",
                "SECURITY_VALIDATION",
                "REGRESSION",
                "ACTIVE",
            ] as const),
        }),
        securityValidation: Object.freeze({
            permissionBoundaryRequired: true as const,
            dataAccessScopeRequired: true as const,
            externalCommunicationRequired: true as const,
            secretHandlingRequired: true as const,
            authorityComplianceRequired: true as const,
        }),
        regressionStandard: Object.freeze({
            unitTestRequired: true as const,
            contractTestRequired: true as const,
            integrationTestRequired: true as const,
            isolationTestRequired: true as const,
        }),
        communicationContract: Object.freeze({
            forbidsDirectInternalAccess: true as const,
            requiresBoundaryContract: true as const,
            requiresContractCompatibility: true as const,
            requiresVersionCompatibility: true as const,
            requiresAuthorityValidation: true as const,
        }),
    });
}

export function establishFramework() {
    return new ExtensionDevelopmentFrameworkBuilder()
        .withFrameworkId("edf-validation")
        .withArchitectureVersion("ASA-ARCH-35.1")
        .withStructuralVersion("0.2")
        .withSchemaVersion("0.2")
        .withSourceGovernanceLayer(establishGovernance())
        .withExtensionTemplate(sampleFrameworkTemplate())
        .define();
}

export function sampleValidationExtensionContract(): ValidationExtensionContract {
    return Object.freeze({
        id: "ASA-VALIDATION",
        version: "1.0.0",
        domain: "Assurance",
        frameworkDomain: "VALIDATION",
        authority: "VALIDATOR",
        lifecycle: "VALIDATED",
        compatibility: Object.freeze([
            "ASA-CORE-34.0",
            "ASA-ARCH-35.x",
            "ASA-ARCH-35.1",
            "ASA-ARCH-36.0",
            "ASA-ARCH-37.0",
            "ASA-ARCH-38.0",
        ]),
        description: "ASA-VALIDATION Extension Validation & Assurance Layer",
        governanceOwner: "ASA-GOV-VALIDATION",
        validationIsNotAuthority: true,
        detectionIsNotCorrection: true,
        reportIsNotDecision: true,
        assessmentIsNotApproval: true,
        certificationIsNotExecution: true,
        verificationIsNotMutation: true,
        certifyIsNotAuthorize: true,
        recommendationIsNotCorrection: true,
        forbidsExecute: true,
        forbidsCoreMutation: true,
        forbidsFrameworkMutation: true,
        forbidsGovernanceMutation: true,
        forbidsExtensionContractMutation: true,
        forbidsPolicyChange: true,
        forbidsGrantAuthority: true,
        forbidsAutomaticCorrection: true,
        forbidsApproveOwnViolation: true,
        forbidsBypassValidation: true,
        forbidsAuthorityEscalation: true,
        permitsObserve: true,
        permitsInspect: true,
        permitsValidate: true,
        permitsCompare: true,
        permitsAnalyze: true,
        permitsGenerateReport: true,
        permitsGenerateFinding: true,
        permitsGenerateAssuranceCertificationResult: true,
        permitsRequestReview: true,
    });
}

export function sampleValidationContract(): ValidationContract {
    return Object.freeze({
        contractId: "val.contract.v1",
        operations: Object.freeze([
            "validate",
            "verify",
            "compare",
            "assess",
            "report",
            "generateCertificationResult",
        ] as const),
        technologyIndependent: true,
        forbidsVendorCoupling: true,
        forbidsAutonomousExecution: true,
        forbidsPolicyMutation: true,
    });
}

export function sampleProviderRole(): ValidationProviderRole {
    return Object.freeze({
        roleId: "val.provider.role.v1",
        validatesContracts: true,
        evaluatesCompliance: true,
        detectsViolations: true,
        collectsEvidenceReference: true,
        producesAssuranceResults: true,
        isNotExecutionProvider: true,
    });
}

export function sampleResultContract(): ValidationResultContract {
    return Object.freeze({
        resultContractId: "val.result.v1",
        requiredFields: Object.freeze([
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
        ] as const),
        allowedTargetTypes: Object.freeze([
            "Architecture",
            "Extension",
            "Contract",
            "Provider",
            "Configuration",
            "ExecutionRecord",
        ] as const),
        allowedStatuses: Object.freeze([
            "PASS",
            "WARN",
            "FAIL",
            "UNKNOWN",
        ] as const),
        allowedRiskLevels: Object.freeze([
            "NONE",
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
        ] as const),
        riskLevelIsAssessmentOnly: true,
        riskLevelDoesNotAuthorizeAction: true,
    });
}

export function sampleConfidence(): ValidationConfidenceContract {
    return Object.freeze({
        confidenceContractId: "val.confidence.v1",
        valueRange: "0.0_TO_1.0",
        requiredFields: Object.freeze([
            "value",
            "reason",
            "calculationMethod",
        ] as const),
        confidenceIsNotApproval: true,
        confidenceIsNotExecutionPermission: true,
    });
}

export function sampleFinding(): FindingContract {
    return Object.freeze({
        findingContractId: "val.finding.v1",
        requiredFields: Object.freeze([
            "id",
            "category",
            "description",
            "severity",
            "evidence",
            "recommendation",
            "status",
            "timestamp",
        ] as const),
        allowedSeverities: Object.freeze([
            "INFO",
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
        ] as const),
        allowedStatuses: Object.freeze([
            "OPEN",
            "ACKNOWLEDGED",
            "RESOLVED",
            "IGNORED",
        ] as const),
        recommendationIsNotCorrection: true,
    });
}

export function sampleRisk(): RiskAssessmentBoundary {
    return Object.freeze({
        boundaryId: "val.risk.v1",
        findingSeverityContributesToRisk: true,
        riskLevelIsAggregateAssessment: true,
        riskLevelDoesNotAuthorizeAction: true,
        riskLevelIsAssessmentInformationOnly: true,
    });
}

export function sampleEvidence(): AssuranceEvidenceContract {
    return Object.freeze({
        evidenceContractId: "val.evidence.v1",
        requiredFields: Object.freeze([
            "source",
            "reference",
            "timestamp",
            "integrityHash",
            "verificationMethod",
        ] as const),
        evidenceMustRemainTraceable: true,
        forbidsFabricationByValidator: true,
        evidenceOriginMustBePreserved: true,
        mayTransformRepresentationOnly: true,
        forbidsAlterEvidenceOrigin: true,
    });
}

export function sampleInput(): ValidationInputBoundary {
    return Object.freeze({
        boundaryId: "val.input.v1",
        allowedInputs: Object.freeze([
            "ARCHITECTURE_SPECIFICATION",
            "EXTENSION_METADATA",
            "CONTRACT_DEFINITION",
            "REGISTRATION_DATA",
            "VERIFICATION_DATA",
            "TEST_RESULT",
            "AUDIT_RECORD",
            "OPS_OBSERVATION_DATA",
            "EXTERNAL_EVIDENCE_CONNECT",
        ] as const),
        inputIsReadOnly: true,
        forbidsDirectRuntimeStateAccess: true,
        forbidsBypassObservationBoundary: true,
        observationDataViaDeclaredContractOnly: true,
        externalEvidenceIsNotExternalAuthority: true,
    });
}

export function sampleOutput(): ValidationOutputBoundary {
    return Object.freeze({
        boundaryId: "val.output.v1",
        allowedOutputs: Object.freeze([
            "VALIDATION_RESULT",
            "COMPLIANCE_REPORT",
            "FINDING",
            "RISK_ASSESSMENT",
            "ASSURANCE_CERTIFICATION_RESULT",
            "REMEDIATION_RECOMMENDATION",
        ] as const),
        forbidsExecutionCommand: true,
        forbidsMutationRequest: true,
        forbidsAutomaticCorrection: true,
        forbidsPolicyMutation: true,
        recommendationIsNotCorrection: true,
    });
}

export function sampleMemory(): ValidationMemoryBoundary {
    return Object.freeze({
        boundaryId: "val.memory.v1",
        historyIsNotRuntimeState: true,
        historyIsNotExecutionState: true,
        historyIsNotGovernanceState: true,
        historyIsNotCoreState: true,
        recordsAreAssuranceOnly: true,
    });
}

export function sampleObservation(): ValidationObservationBoundary {
    return Object.freeze({
        boundaryId: "val.observation.v1",
        consumesExtensionRegistryMetadataOnly: true,
        registryIsNotExecutionAuthority: true,
        forbidsInspectExtensionInternalsViaRegistry: true,
        forbidsDirectRuntimeState: true,
    });
}

export function sampleCertification(): CertificationBoundary {
    return Object.freeze({
        boundaryId: "val.certification.v1",
        producesAssuranceCertificationResult: true,
        certificationIsNotExecutionPermission: true,
        certificationIsNotGovernanceApproval: true,
        certificationIsNotAuthorityGrant: true,
        certificationIsAssessmentResultOnly: true,
    });
}

export function sampleSelfRestriction(): SelfValidationRestriction {
    return Object.freeze({
        restrictionId: "val.self.v1",
        forbidsCertifyOwnImplementationIntegrity: true,
        forbidsCertifyOwnAuthorityBoundary: true,
        forbidsCertifyOwnSecurityCompliance: true,
        requiresIndependentValidation: true,
        independentAuthorityExternalToInstance: true,
    });
}

export function sampleAiOutput(): AiOutputValidationBoundary {
    return Object.freeze({
        boundaryId: "val.ai-output.v1",
        mayValidateAiOutputs: true,
        aiOutputValidationIsNotAiAuthority: true,
        evaluatesOutputOnly: true,
        forbidsModifyAiDecisions: true,
        forbidsBecomeAiAuthority: true,
    });
}

export function sampleCompliance(): ComplianceContract {
    return Object.freeze({
        complianceContractId: "val.compliance.v1",
        targets: Object.freeze([
            "ArchitectureCompliance",
            "AuthorityCompliance",
            "ContractCompliance",
            "SecurityCompliance",
            "LifecycleCompliance",
            "RegressionCompliance",
            "ExtensionCompliance",
        ] as const),
    });
}

export function sampleChangeImpact(): ChangeImpactAnalysisContract {
    return Object.freeze({
        analysisContractId: "val.change-impact.v1",
        identifiesAffectedContracts: true,
        identifiesAffectedExtensions: true,
        identifiesAuthorityImpact: true,
        estimatesRegressionScope: true,
        doesNotApproveChanges: true,
    });
}

export function sampleRegressionAssurance(): RegressionAssuranceContract {
    return Object.freeze({
        regressionContractId: "val.regression.v1",
        regressionVerification: true,
        compatibilityVerification: true,
        hashVerification: true,
        contractVerification: true,
        frozenArchitectureRemainsImmutable: true,
    });
}

export function sampleSecurity(): ValidationSecurityContract {
    return Object.freeze({
        securityContractId: "val.security.v1",
        forbiddenBehaviors: Object.freeze([
            "ModifySecurityPolicy",
            "GrantPrivileges",
            "BypassAuthentication",
            "SuppressFindings",
            "HideFailures",
            "ManipulateValidationResult",
            "ForgeEvidence",
            "AlterAuditRecord",
        ] as const),
        forbidsModifySecurityPolicy: true,
        forbidsGrantPrivileges: true,
        forbidsBypassAuthentication: true,
        forbidsSuppressFindings: true,
        forbidsHideFailures: true,
        forbidsManipulateValidationResult: true,
        forbidsForgeEvidence: true,
        forbidsAlterAuditRecord: true,
    });
}

export function sampleAuditCompat(): ValidationAuditCompatibilityContract {
    return Object.freeze({
        auditCompatibilityId: "val.audit-compat.v1",
        compatibleWithOpsReadOnly: true,
        compatibleWithConnectReadOnly: true,
        compatibleWithAiReadOnly: true,
        integrationIsReadOnly: true,
        forbidsOpsDependencyOwnership: true,
        forbidsConnectDependencyOwnership: true,
        forbidsAiDependencyOwnership: true,
    });
}

export function sampleDeterminism(): ValidationDeterminismPolicy {
    return Object.freeze({
        policyId: "val.determinism.v1",
        requiredMetadata: Object.freeze([
            "validatorVersion",
            "ruleVersion",
            "environmentVersion",
            "configurationVersion",
            "evidenceVersion",
            "timestamp",
        ] as const),
    });
}

export function sampleRegistration(): ValidatorRegistrationContract {
    return Object.freeze({
        registrationContractId: "val.registration.v1",
        requiredFields: Object.freeze([
            "metadata",
            "authority",
            "capabilities",
            "version",
            "validationScope",
            "securityProfile",
            "ruleVersion",
            "validationModel",
        ] as const),
        authorityMustBeValidator: true,
    });
}

export function sampleDiscovery(): ValidatorDiscoveryContract {
    return Object.freeze({
        discoveryContractId: "val.discovery.v1",
        operationLabel: "discoverValidators",
        criteriaDeclaredStructurally: true,
        consumesExtensionRegistryByReference: true,
        registryIsNotExecutionAuthority: true,
        forbidsFrameworkMutation: true,
        isNotRuntimeDiscoveryEngine: true,
    });
}

export function sampleSelection(): ValidatorSelectionContract {
    return Object.freeze({
        selectionContractId: "val.selection.v1",
        operationLabel: "selectValidator",
        criteriaDeclaredStructurally: true,
        forbidsAuthorityEscalation: true,
        forbidsAutonomousExecution: true,
        isNotRuntimeSelectionEngine: true,
    });
}

export function sampleFallback(): ValidatorFallbackStrategyContract {
    return Object.freeze({
        fallbackContractId: "val.fallback.v1",
        requiredFields: Object.freeze([
            "fallbackValidator",
            "manualValidationMode",
            "validationConfidence",
        ] as const),
        manualModePreservesHumanAuthority: true,
    });
}

export function sampleLifecycle(): ValidationLifecycleContract {
    return Object.freeze({
        lifecycleContractId: "val.lifecycle.v1",
        allowedStates: Object.freeze([
            "Created",
            "Initialized",
            "Active",
            "Failed",
            "Suspended",
            "Reinitialized",
            "Terminated",
        ] as const),
        transitionsMustBeExplicit: true,
    });
}

export function baseValidationValidator(): ValidationValidator {
    return new ValidationValidator()
        .withLayerId("val-layer-ok")
        .withArchitectureVersion("ASA-ARCH-39.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withSourceFramework(establishFramework())
        .withExtensionContract(sampleValidationExtensionContract())
        .withValidationContract(sampleValidationContract())
        .withProviderRole(sampleProviderRole())
        .withResultContract(sampleResultContract())
        .withConfidenceContract(sampleConfidence())
        .withFindingContract(sampleFinding())
        .withRiskAssessmentBoundary(sampleRisk())
        .withEvidenceContract(sampleEvidence())
        .withInputBoundary(sampleInput())
        .withOutputBoundary(sampleOutput())
        .withMemoryBoundary(sampleMemory())
        .withObservationBoundary(sampleObservation())
        .withCertificationBoundary(sampleCertification())
        .withSelfValidationRestriction(sampleSelfRestriction())
        .withAiOutputValidationBoundary(sampleAiOutput())
        .withComplianceContract(sampleCompliance())
        .withChangeImpactAnalysis(sampleChangeImpact())
        .withRegressionAssurance(sampleRegressionAssurance())
        .withSecurityContract(sampleSecurity())
        .withAuditCompatibility(sampleAuditCompat())
        .withDeterminismPolicy(sampleDeterminism())
        .withValidatorRegistration(sampleRegistration())
        .withValidatorDiscovery(sampleDiscovery())
        .withValidatorSelection(sampleSelection())
        .withFallbackStrategy(sampleFallback())
        .withLifecycleContract(sampleLifecycle());
}
