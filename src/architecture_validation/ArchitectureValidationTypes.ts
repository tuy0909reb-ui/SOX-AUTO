/**
 * ASA-ARCH-43.0 - Architecture Validation Intelligence Layer (Draft 0.7)
 *
 * Architecture Assurance Layer — External Observation.
 * Validation Capability ≠ Modification Authority.
 * Final judgment authority remains Human Architect.
 *
 * SHALL NOT mutate Core, Frozen Contracts, Architecture State,
 * or introduce automatic repair / freeze / change approval.
 */

export type ValidationAuthorityLevel = "VALIDATION_ANALYST";
export type FinalAuthority = "HUMAN_ARCHITECT";

export type ValidationStatus = "PASS" | "FAIL";

export type ValidationRuleId =
    | "RULE-101"
    | "RULE-102"
    | "RULE-103"
    | "RULE-104"
    | "RULE-105"
    | "RULE-106"
    | "RULE-107";

export type DriftType =
    | "CONTRACT"
    | "BOUNDARY"
    | "IMPLEMENTATION"
    | "RECORD"
    | "EVIDENCE";

export type DriftSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type HealthRecommendation =
    | "NONE"
    | "REVIEW_REQUIRED"
    | "INVESTIGATION_REQUIRED"
    | "MANUAL_VALIDATION_REQUIRED";

export type CanonicalSourceKind =
    | "FROZEN_CONTRACT"
    | "REGISTERED_ARCHITECTURE_SNAPSHOT"
    | "IMPLEMENTATION_EVIDENCE";

export type ValidationReadSource =
    | "CORE_CONTRACT"
    | "EXTENSION_CONTRACT"
    | "CONNECTOR_CONTRACT"
    | "REGISTRATION_RECORD"
    | "FREEZE_RECORD"
    | "FROZEN_ARCHITECTURE_RECORD"
    | "EVOLUTION_RECORD"
    | "IMPLEMENTATION_METADATA"
    | "VALIDATION_RULE_DEFINITION"
    | "VALIDATION_CONFIGURATION"
    | "VALIDATION_VERSION_REGISTRY";

export type ValidationWriteArtifact =
    | "VALIDATION_REPORT"
    | "INTEGRITY_REPORT"
    | "DRIFT_REPORT"
    | "ARCHITECTURE_HEALTH_REPORT"
    | "VALIDATION_EVIDENCE_RECORD"
    | "AUDIT_RECORD";

export interface ValidationAuthorityBoundary {
    readonly authority: ValidationAuthorityLevel;
    readonly finalAuthority: FinalAuthority;
    readonly validationIsNotModificationAuthority: true;
    readonly validationResultIsNotDecisionAuthority: true;
    readonly recommendationIsNotDecision: true;
    readonly recordIsNotCorrectionAuthority: true;
    readonly forbidsModifyCore: true;
    readonly forbidsModifyFrozenContract: true;
    readonly forbidsRepairAutomatically: true;
    readonly forbidsChangeArchitectureState: true;
    readonly forbidsApproveFreeze: true;
    readonly forbidsApproveChange: true;
    readonly forbidsRejectChange: true;
    readonly forbidsTriggerModification: true;
    readonly forbidsOperationalControl: true;
    readonly allowsValidate: true;
    readonly allowsDetect: true;
    readonly allowsReport: true;
    readonly allowsRecommend: true;
}

export interface ValidationReadWriteBoundary {
    readonly architectureSourceAccess: "READ_ONLY";
    readonly readableSources: ReadonlyArray<ValidationReadSource>;
    readonly writableArtifacts: ReadonlyArray<ValidationWriteArtifact>;
    readonly forbidsArchitectureSourceWrite: true;
}

export interface CanonicalSourceModel {
    readonly canonicalSources: ReadonlyArray<CanonicalSourceKind>;
    readonly validationEvidenceSeparatedFromCanonicalSource: true;
    readonly validationTargetMustReferenceCanonicalSource: true;
}

export interface ImplementationMetadataScope {
    readonly allowsExistenceVerification: true;
    readonly allowsVersionVerification: true;
    readonly allowsArtifactHashVerification: true;
    readonly allowsRegistrationAlignmentVerification: true;
    readonly forbidsImplementationLogicEvaluation: true;
    readonly forbidsCodeQualityJudgment: true;
    readonly forbidsBusinessLogicReview: true;
    readonly forbidsAutomaticCodeCorrection: true;
    readonly implementationDriftIsMetadataAlignmentOnly: true;
}
