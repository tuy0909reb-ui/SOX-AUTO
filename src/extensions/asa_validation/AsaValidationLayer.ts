/**
 * ASA-ARCH-39.0 - ASA-VALIDATION Extension Assurance Layer model (Draft 0.4)
 *
 * Immutable aggregate of Validation / Assurance domain contracts.
 * Validator / Assurance provider — not an Execution subject.
 *
 * SHALL NOT contain validation engines, remediation engines,
 * discovery engines, or selection engines.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import type { AssuranceEvidenceContract } from "./AssuranceEvidenceContract";
import type {
    FindingContract,
    RiskAssessmentBoundary,
} from "./FindingContract";
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
} from "./ValidationBoundaryContract";
import type {
    ValidationContract,
    ValidationProviderRole,
} from "./ValidationContract";
import type { ValidationExtensionContract } from "./ValidationExtensionContract";
import type {
    ValidationLifecycleContract,
    ValidatorDiscoveryContract,
    ValidatorFallbackStrategyContract,
    ValidatorRegistrationContract,
    ValidatorSelectionContract,
} from "./ValidationProviderRegistration";
import type {
    ValidationConfidenceContract,
    ValidationResultContract,
} from "./ValidationResultContract";
import type {
    ValidationAuditCompatibilityContract,
    ValidationDeterminismPolicy,
    ValidationSecurityContract,
} from "./ValidationSecurityContract";

/** Stable Validation layer identity. */
export type AsaValidationLayerId = string;

/**
 * Security / authority boundary summary for Validation layer.
 */
export interface ValidationLayerSecurityBoundary {
    readonly holdsDecisionAuthority: false;
    readonly holdsExecutionAuthority: false;
    readonly holdsPolicyAuthority: false;
    readonly holdsValidatorResponsibility: true;
    readonly forbidsAuthorityEscalation: true;
}

/**
 * Sibling extension independence declaration.
 */
export interface ValidationSiblingIndependence {
    readonly peerToOps: true;
    readonly peerToConnect: true;
    readonly peerToAi: true;
    readonly forbidsOpsDependencyOwnership: true;
    readonly forbidsConnectDependencyOwnership: true;
    readonly forbidsAiDependencyOwnership: true;
    readonly forbidsCoreIntrusion: true;
}

/**
 * Structural metadata only.
 */
export interface AsaValidationLayerMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesGovernanceContract: true;
    readonly preservesFrameworkContract: true;
    readonly preservesOpsContract: true;
    readonly preservesConnectContract: true;
    readonly preservesAiContract: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Immutable Validation layer props.
 */
export interface AsaValidationLayerProps {
    readonly identity: {
        readonly layerId: AsaValidationLayerId;
        readonly extensionId: "ASA-VALIDATION";
        readonly coreVersion: "ASA-CORE-34.0";
        readonly architectureVersion: string;
        readonly structuralVersion: string;
        readonly sourceFrameworkId: string;
    };
    readonly metadata: AsaValidationLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: ValidationExtensionContract;
    readonly validationContract: ValidationContract;
    readonly providerRole: ValidationProviderRole;
    readonly resultContract: ValidationResultContract;
    readonly confidenceContract: ValidationConfidenceContract;
    readonly findingContract: FindingContract;
    readonly riskAssessmentBoundary: RiskAssessmentBoundary;
    readonly evidenceContract: AssuranceEvidenceContract;
    readonly inputBoundary: ValidationInputBoundary;
    readonly outputBoundary: ValidationOutputBoundary;
    readonly memoryBoundary: ValidationMemoryBoundary;
    readonly observationBoundary: ValidationObservationBoundary;
    readonly certificationBoundary: CertificationBoundary;
    readonly selfValidationRestriction: SelfValidationRestriction;
    readonly aiOutputValidationBoundary: AiOutputValidationBoundary;
    readonly complianceContract: ComplianceContract;
    readonly changeImpactAnalysis: ChangeImpactAnalysisContract;
    readonly regressionAssurance: RegressionAssuranceContract;
    readonly securityContract: ValidationSecurityContract;
    readonly auditCompatibility: ValidationAuditCompatibilityContract;
    readonly determinismPolicy: ValidationDeterminismPolicy;
    readonly validatorRegistration: ValidatorRegistrationContract;
    readonly validatorDiscovery: ValidatorDiscoveryContract;
    readonly validatorSelection: ValidatorSelectionContract;
    readonly fallbackStrategy: ValidatorFallbackStrategyContract;
    readonly lifecycleContract: ValidationLifecycleContract;
    readonly securityBoundary: ValidationLayerSecurityBoundary;
    readonly siblingIndependence: ValidationSiblingIndependence;
}

/**
 * Immutable ASA-VALIDATION Extension Validation & Assurance Layer.
 */
export class AsaValidationLayer implements AsaValidationLayerProps {
    readonly identity: AsaValidationLayerProps["identity"];
    readonly metadata: AsaValidationLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: ValidationExtensionContract;
    readonly validationContract: ValidationContract;
    readonly providerRole: ValidationProviderRole;
    readonly resultContract: ValidationResultContract;
    readonly confidenceContract: ValidationConfidenceContract;
    readonly findingContract: FindingContract;
    readonly riskAssessmentBoundary: RiskAssessmentBoundary;
    readonly evidenceContract: AssuranceEvidenceContract;
    readonly inputBoundary: ValidationInputBoundary;
    readonly outputBoundary: ValidationOutputBoundary;
    readonly memoryBoundary: ValidationMemoryBoundary;
    readonly observationBoundary: ValidationObservationBoundary;
    readonly certificationBoundary: CertificationBoundary;
    readonly selfValidationRestriction: SelfValidationRestriction;
    readonly aiOutputValidationBoundary: AiOutputValidationBoundary;
    readonly complianceContract: ComplianceContract;
    readonly changeImpactAnalysis: ChangeImpactAnalysisContract;
    readonly regressionAssurance: RegressionAssuranceContract;
    readonly securityContract: ValidationSecurityContract;
    readonly auditCompatibility: ValidationAuditCompatibilityContract;
    readonly determinismPolicy: ValidationDeterminismPolicy;
    readonly validatorRegistration: ValidatorRegistrationContract;
    readonly validatorDiscovery: ValidatorDiscoveryContract;
    readonly validatorSelection: ValidatorSelectionContract;
    readonly fallbackStrategy: ValidatorFallbackStrategyContract;
    readonly lifecycleContract: ValidationLifecycleContract;
    readonly securityBoundary: ValidationLayerSecurityBoundary;
    readonly siblingIndependence: ValidationSiblingIndependence;

    /**
     * Package-internal constructor.
     * Prefer ValidationValidator.establish().
     */
    constructor(init: AsaValidationLayerProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceFramework = init.sourceFramework;
        this.extensionContract = init.extensionContract;
        this.validationContract = init.validationContract;
        this.providerRole = init.providerRole;
        this.resultContract = init.resultContract;
        this.confidenceContract = init.confidenceContract;
        this.findingContract = init.findingContract;
        this.riskAssessmentBoundary = init.riskAssessmentBoundary;
        this.evidenceContract = init.evidenceContract;
        this.inputBoundary = init.inputBoundary;
        this.outputBoundary = init.outputBoundary;
        this.memoryBoundary = init.memoryBoundary;
        this.observationBoundary = init.observationBoundary;
        this.certificationBoundary = init.certificationBoundary;
        this.selfValidationRestriction = init.selfValidationRestriction;
        this.aiOutputValidationBoundary = init.aiOutputValidationBoundary;
        this.complianceContract = init.complianceContract;
        this.changeImpactAnalysis = init.changeImpactAnalysis;
        this.regressionAssurance = init.regressionAssurance;
        this.securityContract = init.securityContract;
        this.auditCompatibility = init.auditCompatibility;
        this.determinismPolicy = init.determinismPolicy;
        this.validatorRegistration = init.validatorRegistration;
        this.validatorDiscovery = init.validatorDiscovery;
        this.validatorSelection = init.validatorSelection;
        this.fallbackStrategy = init.fallbackStrategy;
        this.lifecycleContract = init.lifecycleContract;
        this.securityBoundary = Object.freeze({ ...init.securityBoundary });
        this.siblingIndependence = Object.freeze({
            ...init.siblingIndependence,
        });
        Object.freeze(this);
    }
}
