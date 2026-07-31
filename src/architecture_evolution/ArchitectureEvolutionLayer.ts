/**
 * ASA-ARCH-42.0 - Architecture Evolution Intelligence Layer Aggregate (Draft 0.6)
 *
 * Immutable Governance Intelligence aggregate.
 * Analysis Capability ≠ Decision Authority.
 */

import type {
    EvolutionAnalysisScope,
    EvolutionAuthorityBoundary,
    EvolutionReadWriteBoundary,
} from "./ArchitectureEvolutionTypes";
import type { EvolutionProposalSchemaContract } from "./EvolutionProposal";
import type { ImpactReportSchemaContract } from "./ImpactReport";
import type { HashIntegrityPipeline } from "./HashIntegrity";
import type { ValidationRuleSet } from "./ValidationRules";
import type {
    EvolutionVersionSet,
    VersioningPolicy,
} from "./Versioning";
import type { EvolutionPlannerRole } from "./EvolutionPlanner";
import type { ContractAnalyzerRole } from "./ContractAnalyzer";
import type { ImpactAnalyzerRole } from "./ImpactAnalyzer";
import type { CompatibilityValidatorRole } from "./CompatibilityValidator";
import type { CompatibilityRules } from "./CompatibilityValidator";
import type { GovernanceRecorderRole } from "./GovernanceRecorder";

export type ArchitectureEvolutionLayerId = string;

export interface ArchitectureEvolutionLayerMetadata {
    readonly architectureVersion: "ASA-ARCH-42.0";
    readonly schemaVersion: string;
    readonly draft: "0.6";
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesFrozenContracts: true;
    readonly preservesExtensionContracts: true;
    readonly preservesChapters1Through41: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

export interface ArchitectureEvolutionLayerProps {
    readonly identity: {
        readonly layerId: ArchitectureEvolutionLayerId;
        readonly layerName: "Architecture Evolution Intelligence Layer";
        readonly coreVersion: "ASA-CORE-34.0";
    };
    readonly metadata: ArchitectureEvolutionLayerMetadata;
    readonly authorityBoundary: EvolutionAuthorityBoundary;
    readonly readWriteBoundary: EvolutionReadWriteBoundary;
    readonly analysisScope: EvolutionAnalysisScope;
    readonly proposalSchema: EvolutionProposalSchemaContract;
    readonly impactSchema: ImpactReportSchemaContract;
    readonly validationRules: ValidationRuleSet;
    readonly hashPipeline: HashIntegrityPipeline;
    readonly versionSet: EvolutionVersionSet;
    readonly versioningPolicy: VersioningPolicy;
    readonly plannerRole: EvolutionPlannerRole;
    readonly analyzerRole: ContractAnalyzerRole;
    readonly impactRole: ImpactAnalyzerRole;
    readonly compatibilityRole: CompatibilityValidatorRole;
    readonly compatibilityRules: CompatibilityRules;
    readonly recorderRole: GovernanceRecorderRole;
}

export class ArchitectureEvolutionLayer {
    readonly identity: ArchitectureEvolutionLayerProps["identity"];
    readonly metadata: ArchitectureEvolutionLayerMetadata;
    readonly authorityBoundary: EvolutionAuthorityBoundary;
    readonly readWriteBoundary: EvolutionReadWriteBoundary;
    readonly analysisScope: EvolutionAnalysisScope;
    readonly proposalSchema: EvolutionProposalSchemaContract;
    readonly impactSchema: ImpactReportSchemaContract;
    readonly validationRules: ValidationRuleSet;
    readonly hashPipeline: HashIntegrityPipeline;
    readonly versionSet: EvolutionVersionSet;
    readonly versioningPolicy: VersioningPolicy;
    readonly plannerRole: EvolutionPlannerRole;
    readonly analyzerRole: ContractAnalyzerRole;
    readonly impactRole: ImpactAnalyzerRole;
    readonly compatibilityRole: CompatibilityValidatorRole;
    readonly compatibilityRules: CompatibilityRules;
    readonly recorderRole: GovernanceRecorderRole;

    constructor(props: ArchitectureEvolutionLayerProps) {
        this.identity = Object.freeze({ ...props.identity });
        this.metadata = Object.freeze({ ...props.metadata });
        this.authorityBoundary = props.authorityBoundary;
        this.readWriteBoundary = props.readWriteBoundary;
        this.analysisScope = props.analysisScope;
        this.proposalSchema = props.proposalSchema;
        this.impactSchema = props.impactSchema;
        this.validationRules = props.validationRules;
        this.hashPipeline = props.hashPipeline;
        this.versionSet = props.versionSet;
        this.versioningPolicy = props.versioningPolicy;
        this.plannerRole = props.plannerRole;
        this.analyzerRole = props.analyzerRole;
        this.impactRole = props.impactRole;
        this.compatibilityRole = props.compatibilityRole;
        this.compatibilityRules = props.compatibilityRules;
        this.recorderRole = props.recorderRole;
        Object.freeze(this);
    }
}
