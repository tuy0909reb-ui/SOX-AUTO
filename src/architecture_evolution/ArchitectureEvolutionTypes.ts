/**
 * ASA-ARCH-42.0 - Architecture Evolution Intelligence Layer (Draft 0.6)
 *
 * Declarative type definitions for Governance Intelligence.
 * Analysis Capability ≠ Decision Authority.
 * Final judgment authority remains Human Architect.
 *
 * SHALL NOT mutate Core, Frozen Contracts, or Extension Contracts.
 * SHALL NOT contain automatic approval / freeze / implementation engines.
 */

/** Architecture chapter reference (structural). */
export type ArchitectureChapterVersion = string;

/**
 * Local authority for Chapter 42.
 * Not a mutation of frozen ExtensionAuthorityLevel.
 */
export type EvolutionAuthorityLevel = "EVOLUTION_ANALYST";

/** Final acceptance / approval authority (outside Chapter 42). */
export type FinalAuthority = "HUMAN_ARCHITECT";

/** Risk levels for proposals. */
export type EvolutionRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Proposal approval state — recorded only; Chapter 42 never auto-approves. */
export type ProposalApprovalState =
    | "DRAFT"
    | "SUBMITTED"
    | "PENDING_HUMAN"
    | "APPROVED"
    | "REJECTED"
    | "WITHDRAWN";

/** Impact severity. */
export type ImpactSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Architecture evolution record kinds. */
export type EvolutionRecordType =
    | "PROPOSAL"
    | "ANALYSIS"
    | "APPROVAL"
    | "FREEZE";

/** Snapshot kinds. */
export type ContractSnapshotKind =
    | "CURRENT_CONTRACT"
    | "PROPOSED_CONTRACT"
    | "IMPACT_ANALYSIS"
    | "DECISION";

/** Compatibility outcome. */
export type CompatibilityOutcome = "PASS" | "FAIL";

/** Validation rule outcome. */
export type ValidationOutcome = "PASS" | "FAIL";

/** Validation rule identifiers. */
export type ValidationRuleId =
    | "RULE-001"
    | "RULE-002"
    | "RULE-003"
    | "RULE-004"
    | "RULE-005"
    | "RULE-006";

/** Architecture source read surface (read-only). */
export type ArchitectureSourceKind =
    | "ASA_CORE_CONTRACT"
    | "EXTENSION_CONTRACT"
    | "REGISTRATION_RECORD"
    | "FREEZE_RECORD"
    | "ARCHITECTURE_HISTORY";

/** Chapter 42 write surface (generated records only). */
export type EvolutionGeneratedArtifactKind =
    | "EVOLUTION_PROPOSAL"
    | "CONTRACT_ANALYSIS_RESULT"
    | "IMPACT_REPORT"
    | "COMPATIBILITY_RESULT"
    | "ARCHITECTURE_EVOLUTION_RECORD"
    | "AUDIT_RECORD";

/**
 * Layer authority / boundary contract.
 */
export interface EvolutionAuthorityBoundary {
    readonly authority: EvolutionAuthorityLevel;
    readonly finalAuthority: FinalAuthority;
    readonly analysisIsNotDecisionAuthority: true;
    readonly automationIsNotAutonomousAuthority: true;
    readonly recordGenerationIsNotApprovalAuthority: true;
    readonly forbidsModifyCore: true;
    readonly forbidsModifyFrozenContract: true;
    readonly forbidsGenerateAutomaticImplementation: true;
    readonly forbidsRegisterExtensionAutomatically: true;
    readonly forbidsApproveFreeze: true;
    readonly forbidsAutomaticDecision: true;
    readonly forbidsWriteArchitectureSource: true;
    readonly allowsAnalyze: true;
    readonly allowsEvaluate: true;
    readonly allowsRecommend: true;
    readonly allowsRecord: true;
}

/**
 * Read / Write boundary contract.
 */
export interface EvolutionReadWriteBoundary {
    readonly architectureSourceAccess: "READ_ONLY";
    readonly readableSources: ReadonlyArray<ArchitectureSourceKind>;
    readonly writableArtifacts: ReadonlyArray<EvolutionGeneratedArtifactKind>;
    readonly forbidsArchitectureSourceWrite: true;
}

/**
 * Analysis scope boundary.
 */
export interface EvolutionAnalysisScope {
    readonly inScope: ReadonlyArray<
        | "ARCHITECTURE_CONTRACT"
        | "CONTRACT_DEPENDENCY"
        | "EXTENSION_RELATIONSHIP"
        | "COMPATIBILITY_IMPACT"
        | "EVOLUTION_HISTORY"
    >;
    readonly outOfScope: ReadonlyArray<
        | "RUNTIME_EXECUTION_DATA"
        | "BUSINESS_DECISION"
        | "APPLICATION_LOGIC_IMPLEMENTATION"
        | "HUMAN_FINAL_JUDGMENT"
    >;
    readonly architectureIntentIsNotArchitectureAuthority: true;
}
