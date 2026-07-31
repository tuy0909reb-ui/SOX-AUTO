/**
 * ASA-ARCH-39.0 - Validation Boundary Contracts (Draft 0.4)
 *
 * Input / Output / Memory / Observation / Certification /
 * Self-validation / AI-output / Compliance / Change-impact boundaries.
 * Structural declarations only.
 */

/** Allowed validation input kinds. */
export type ValidationInputKind =
    | "ARCHITECTURE_SPECIFICATION"
    | "EXTENSION_METADATA"
    | "CONTRACT_DEFINITION"
    | "REGISTRATION_DATA"
    | "VERIFICATION_DATA"
    | "TEST_RESULT"
    | "AUDIT_RECORD"
    | "OPS_OBSERVATION_DATA"
    | "EXTERNAL_EVIDENCE_CONNECT";

/** Allowed validation output kinds. */
export type ValidationOutputKind =
    | "VALIDATION_RESULT"
    | "COMPLIANCE_REPORT"
    | "FINDING"
    | "RISK_ASSESSMENT"
    | "ASSURANCE_CERTIFICATION_RESULT"
    | "REMEDIATION_RECOMMENDATION";

/** Compliance target kinds. */
export type ComplianceTargetKind =
    | "ArchitectureCompliance"
    | "AuthorityCompliance"
    | "ContractCompliance"
    | "SecurityCompliance"
    | "LifecycleCompliance"
    | "RegressionCompliance"
    | "ExtensionCompliance";

/**
 * Validation Input Boundary.
 */
export interface ValidationInputBoundary {
    readonly boundaryId: string;
    readonly allowedInputs: ReadonlyArray<ValidationInputKind>;
    readonly inputIsReadOnly: true;
    readonly forbidsDirectRuntimeStateAccess: true;
    readonly forbidsBypassObservationBoundary: true;
    readonly observationDataViaDeclaredContractOnly: true;
    readonly externalEvidenceIsNotExternalAuthority: true;
}

/**
 * Validation Output Boundary.
 */
export interface ValidationOutputBoundary {
    readonly boundaryId: string;
    readonly allowedOutputs: ReadonlyArray<ValidationOutputKind>;
    readonly forbidsExecutionCommand: true;
    readonly forbidsMutationRequest: true;
    readonly forbidsAutomaticCorrection: true;
    readonly forbidsPolicyMutation: true;
    readonly recommendationIsNotCorrection: true;
}

/**
 * Validation Memory Boundary — assurance records ≠ architecture state.
 */
export interface ValidationMemoryBoundary {
    readonly boundaryId: string;
    readonly historyIsNotRuntimeState: true;
    readonly historyIsNotExecutionState: true;
    readonly historyIsNotGovernanceState: true;
    readonly historyIsNotCoreState: true;
    readonly recordsAreAssuranceOnly: true;
}

/**
 * Observation Boundary — registry metadata / OPS observation consumption.
 */
export interface ValidationObservationBoundary {
    readonly boundaryId: string;
    readonly consumesExtensionRegistryMetadataOnly: true;
    readonly registryIsNotExecutionAuthority: true;
    readonly forbidsInspectExtensionInternalsViaRegistry: true;
    readonly forbidsDirectRuntimeState: true;
}

/**
 * Certification Boundary — assessment result only.
 */
export interface CertificationBoundary {
    readonly boundaryId: string;
    readonly producesAssuranceCertificationResult: true;
    readonly certificationIsNotExecutionPermission: true;
    readonly certificationIsNotGovernanceApproval: true;
    readonly certificationIsNotAuthorityGrant: true;
    readonly certificationIsAssessmentResultOnly: true;
}

/**
 * Self Validation Restriction.
 */
export interface SelfValidationRestriction {
    readonly restrictionId: string;
    readonly forbidsCertifyOwnImplementationIntegrity: true;
    readonly forbidsCertifyOwnAuthorityBoundary: true;
    readonly forbidsCertifyOwnSecurityCompliance: true;
    readonly requiresIndependentValidation: true;
    readonly independentAuthorityExternalToInstance: true;
}

/**
 * AI Output Validation Boundary.
 */
export interface AiOutputValidationBoundary {
    readonly boundaryId: string;
    readonly mayValidateAiOutputs: true;
    readonly aiOutputValidationIsNotAiAuthority: true;
    readonly evaluatesOutputOnly: true;
    readonly forbidsModifyAiDecisions: true;
    readonly forbidsBecomeAiAuthority: true;
}

/**
 * Compliance Contract surface.
 */
export interface ComplianceContract {
    readonly complianceContractId: string;
    readonly targets: ReadonlyArray<ComplianceTargetKind>;
}

/**
 * Change Impact Analysis surface (does not approve changes).
 */
export interface ChangeImpactAnalysisContract {
    readonly analysisContractId: string;
    readonly identifiesAffectedContracts: true;
    readonly identifiesAffectedExtensions: true;
    readonly identifiesAuthorityImpact: true;
    readonly estimatesRegressionScope: true;
    readonly doesNotApproveChanges: true;
}

/**
 * Regression Assurance surface.
 */
export interface RegressionAssuranceContract {
    readonly regressionContractId: string;
    readonly regressionVerification: true;
    readonly compatibilityVerification: true;
    readonly hashVerification: true;
    readonly contractVerification: true;
    readonly frozenArchitectureRemainsImmutable: true;
}

export function freezeValidationInputBoundary(
    boundary: ValidationInputBoundary
): ValidationInputBoundary {
    return Object.freeze({
        ...boundary,
        allowedInputs: Object.freeze([...boundary.allowedInputs]),
    });
}

export function freezeValidationOutputBoundary(
    boundary: ValidationOutputBoundary
): ValidationOutputBoundary {
    return Object.freeze({
        ...boundary,
        allowedOutputs: Object.freeze([...boundary.allowedOutputs]),
    });
}

export function freezeValidationMemoryBoundary(
    boundary: ValidationMemoryBoundary
): ValidationMemoryBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeValidationObservationBoundary(
    boundary: ValidationObservationBoundary
): ValidationObservationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeCertificationBoundary(
    boundary: CertificationBoundary
): CertificationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeSelfValidationRestriction(
    restriction: SelfValidationRestriction
): SelfValidationRestriction {
    return Object.freeze({ ...restriction });
}

export function freezeAiOutputValidationBoundary(
    boundary: AiOutputValidationBoundary
): AiOutputValidationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeComplianceContract(
    contract: ComplianceContract
): ComplianceContract {
    return Object.freeze({
        ...contract,
        targets: Object.freeze([...contract.targets]),
    });
}

export function freezeChangeImpactAnalysisContract(
    contract: ChangeImpactAnalysisContract
): ChangeImpactAnalysisContract {
    return Object.freeze({ ...contract });
}

export function freezeRegressionAssuranceContract(
    contract: RegressionAssuranceContract
): RegressionAssuranceContract {
    return Object.freeze({ ...contract });
}
