/**
 * ASA-ARCH-42.0 - Architecture Evolution Intelligence Builder (Draft 0.6)
 *
 * Establishes the immutable Architecture Evolution Intelligence Layer.
 * Structural validation only — not an approval / freeze / implementation engine.
 * Does NOT mutate Core, Frozen Contracts, or Chapters 1–41.
 */

import {
    ArchitectureEvolutionLayer,
    type ArchitectureEvolutionLayerMetadata,
} from "./ArchitectureEvolutionLayer";
import type {
    EvolutionAnalysisScope,
    EvolutionAuthorityBoundary,
    EvolutionReadWriteBoundary,
} from "./ArchitectureEvolutionTypes";
import { freezeEvolutionProposalSchema } from "./EvolutionProposal";
import { freezeImpactReportSchema } from "./ImpactReport";
import { freezeHashIntegrityPipeline } from "./HashIntegrity";
import { freezeValidationRuleSet } from "./ValidationRules";
import {
    freezeEvolutionVersionSet,
    freezeVersioningPolicy,
} from "./Versioning";
import { freezeEvolutionPlannerRole } from "./EvolutionPlanner";
import { freezeContractAnalyzerRole } from "./ContractAnalyzer";
import { freezeImpactAnalyzerRole } from "./ImpactAnalyzer";
import {
    freezeCompatibilityRules,
    freezeCompatibilityValidatorRole,
} from "./CompatibilityValidator";
import { freezeGovernanceRecorderRole } from "./GovernanceRecorder";

const ARCH = "ASA-ARCH-42.0" as const;
const CORE = "ASA-CORE-34.0" as const;
const SCHEMA = "1.0.0";

function freezeAuthorityBoundary(): EvolutionAuthorityBoundary {
    return Object.freeze({
        authority: "EVOLUTION_ANALYST" as const,
        finalAuthority: "HUMAN_ARCHITECT" as const,
        analysisIsNotDecisionAuthority: true as const,
        automationIsNotAutonomousAuthority: true as const,
        recordGenerationIsNotApprovalAuthority: true as const,
        forbidsModifyCore: true as const,
        forbidsModifyFrozenContract: true as const,
        forbidsGenerateAutomaticImplementation: true as const,
        forbidsRegisterExtensionAutomatically: true as const,
        forbidsApproveFreeze: true as const,
        forbidsAutomaticDecision: true as const,
        forbidsWriteArchitectureSource: true as const,
        allowsAnalyze: true as const,
        allowsEvaluate: true as const,
        allowsRecommend: true as const,
        allowsRecord: true as const,
    });
}

function freezeReadWriteBoundary(): EvolutionReadWriteBoundary {
    return Object.freeze({
        architectureSourceAccess: "READ_ONLY" as const,
        readableSources: Object.freeze([
            "ASA_CORE_CONTRACT",
            "EXTENSION_CONTRACT",
            "REGISTRATION_RECORD",
            "FREEZE_RECORD",
            "ARCHITECTURE_HISTORY",
        ] as const),
        writableArtifacts: Object.freeze([
            "EVOLUTION_PROPOSAL",
            "CONTRACT_ANALYSIS_RESULT",
            "IMPACT_REPORT",
            "COMPATIBILITY_RESULT",
            "ARCHITECTURE_EVOLUTION_RECORD",
            "AUDIT_RECORD",
        ] as const),
        forbidsArchitectureSourceWrite: true as const,
    });
}

function freezeAnalysisScope(): EvolutionAnalysisScope {
    return Object.freeze({
        inScope: Object.freeze([
            "ARCHITECTURE_CONTRACT",
            "CONTRACT_DEPENDENCY",
            "EXTENSION_RELATIONSHIP",
            "COMPATIBILITY_IMPACT",
            "EVOLUTION_HISTORY",
        ] as const),
        outOfScope: Object.freeze([
            "RUNTIME_EXECUTION_DATA",
            "BUSINESS_DECISION",
            "APPLICATION_LOGIC_IMPLEMENTATION",
            "HUMAN_FINAL_JUDGMENT",
        ] as const),
        architectureIntentIsNotArchitectureAuthority: true as const,
    });
}

export class ArchitectureEvolutionBuilder {
    private layerId = "asa-arch-42.0";
    private creationTimestamp?: string;
    private producerIdentity?: string;
    private architectureVersion = ARCH;
    private contractVersion = "1.0.0";
    private proposalVersion = "1.0.0";
    private recordVersion = "1.0.0";

    withLayerId(id: string): this {
        this.layerId = id;
        return this;
    }

    withCreationTimestamp(ts: string): this {
        this.creationTimestamp = ts;
        return this;
    }

    withProducerIdentity(id: string): this {
        this.producerIdentity = id;
        return this;
    }

    withVersionSet(input: {
        readonly architectureVersion?: string;
        readonly contractVersion?: string;
        readonly proposalVersion?: string;
        readonly recordVersion?: string;
    }): this {
        if (input.architectureVersion) {
            this.architectureVersion = input.architectureVersion as typeof ARCH;
        }
        if (input.contractVersion) this.contractVersion = input.contractVersion;
        if (input.proposalVersion) this.proposalVersion = input.proposalVersion;
        if (input.recordVersion) this.recordVersion = input.recordVersion;
        return this;
    }

    establish(): ArchitectureEvolutionLayer {
        if (this.architectureVersion !== ARCH) {
            throw new Error(
                `ArchitectureEvolutionBuilder: architectureVersion must be ${ARCH}`
            );
        }

        const metadata: ArchitectureEvolutionLayerMetadata = Object.freeze({
            architectureVersion: ARCH,
            schemaVersion: SCHEMA,
            draft: "0.6" as const,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesFrozenContracts: true as const,
            preservesExtensionContracts: true as const,
            preservesChapters1Through41: true as const,
            creationTimestamp: this.creationTimestamp,
            producerIdentity: this.producerIdentity,
        });

        const authorityBoundary = freezeAuthorityBoundary();
        const recorderRole = freezeGovernanceRecorderRole();
        if (
            !authorityBoundary.recordGenerationIsNotApprovalAuthority ||
            !recorderRole.recordGenerationIsNotApprovalAuthority
        ) {
            throw new Error("RULE-006 Authority Separation violated");
        }
        if (!authorityBoundary.forbidsApproveFreeze) {
            throw new Error("Freeze approval must remain forbidden");
        }
        if (!authorityBoundary.forbidsModifyCore) {
            throw new Error("Core modification must remain forbidden");
        }

        return new ArchitectureEvolutionLayer({
            identity: Object.freeze({
                layerId: this.layerId,
                layerName: "Architecture Evolution Intelligence Layer" as const,
                coreVersion: CORE,
            }),
            metadata,
            authorityBoundary,
            readWriteBoundary: freezeReadWriteBoundary(),
            analysisScope: freezeAnalysisScope(),
            proposalSchema: freezeEvolutionProposalSchema(),
            impactSchema: freezeImpactReportSchema(),
            validationRules: freezeValidationRuleSet(),
            hashPipeline: freezeHashIntegrityPipeline(),
            versionSet: freezeEvolutionVersionSet({
                architectureVersion: this.architectureVersion,
                contractVersion: this.contractVersion,
                proposalVersion: this.proposalVersion,
                recordVersion: this.recordVersion,
            }),
            versioningPolicy: freezeVersioningPolicy(),
            plannerRole: freezeEvolutionPlannerRole(),
            analyzerRole: freezeContractAnalyzerRole(),
            impactRole: freezeImpactAnalyzerRole(),
            compatibilityRole: freezeCompatibilityValidatorRole(),
            compatibilityRules: freezeCompatibilityRules(),
            recorderRole,
        });
    }
}
