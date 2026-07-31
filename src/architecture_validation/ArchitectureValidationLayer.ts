/**
 * ASA-ARCH-43.0 - Architecture Validation Intelligence Layer Aggregate (Draft 0.7)
 */

import type {
    CanonicalSourceModel,
    ImplementationMetadataScope,
    ValidationAuthorityBoundary,
    ValidationReadWriteBoundary,
} from "./ArchitectureValidationTypes";
import type { HashIntegrityPipeline } from "./HashIntegrity";
import type { ValidationRuleSet } from "./ValidationRules";
import type { ValidationRuleEngineRole } from "./ValidationRuleEngine";
import type { ContractValidatorRole } from "./ContractValidator";
import type {
    BoundaryRules,
    BoundaryValidatorRole,
} from "./BoundaryValidator";
import type { FreezeIntegrityValidatorRole } from "./FreezeIntegrityValidator";
import type { DriftDetectorRole } from "./DriftDetector";
import type {
    EvidenceCollectorRole,
    HealthReporterRole,
    ValidationRecorderRole,
} from "./EvidenceHealthRecorder";

export type ArchitectureValidationLayerId = string;

export interface ArchitectureValidationLayerMetadata {
    readonly architectureVersion: "ASA-ARCH-43.0";
    readonly schemaVersion: string;
    readonly draft: "0.7";
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesFrozenContracts: true;
    readonly preservesExtensionContracts: true;
    readonly preservesConnectorContracts: true;
    readonly preservesChapters1Through42: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

export interface ArchitectureValidationLayerProps {
    readonly identity: {
        readonly layerId: ArchitectureValidationLayerId;
        readonly layerName: "Architecture Validation Intelligence Layer";
        readonly coreVersion: "ASA-CORE-34.0";
    };
    readonly metadata: ArchitectureValidationLayerMetadata;
    readonly authorityBoundary: ValidationAuthorityBoundary;
    readonly readWriteBoundary: ValidationReadWriteBoundary;
    readonly canonicalSourceModel: CanonicalSourceModel;
    readonly implementationMetadataScope: ImplementationMetadataScope;
    readonly validationRules: ValidationRuleSet;
    readonly hashPipeline: HashIntegrityPipeline;
    readonly ruleEngineRole: ValidationRuleEngineRole;
    readonly contractValidatorRole: ContractValidatorRole;
    readonly boundaryValidatorRole: BoundaryValidatorRole;
    readonly boundaryRules: BoundaryRules;
    readonly freezeIntegrityRole: FreezeIntegrityValidatorRole;
    readonly driftDetectorRole: DriftDetectorRole;
    readonly evidenceCollectorRole: EvidenceCollectorRole;
    readonly healthReporterRole: HealthReporterRole;
    readonly validationRecorderRole: ValidationRecorderRole;
}

export class ArchitectureValidationLayer {
    readonly identity: ArchitectureValidationLayerProps["identity"];
    readonly metadata: ArchitectureValidationLayerMetadata;
    readonly authorityBoundary: ValidationAuthorityBoundary;
    readonly readWriteBoundary: ValidationReadWriteBoundary;
    readonly canonicalSourceModel: CanonicalSourceModel;
    readonly implementationMetadataScope: ImplementationMetadataScope;
    readonly validationRules: ValidationRuleSet;
    readonly hashPipeline: HashIntegrityPipeline;
    readonly ruleEngineRole: ValidationRuleEngineRole;
    readonly contractValidatorRole: ContractValidatorRole;
    readonly boundaryValidatorRole: BoundaryValidatorRole;
    readonly boundaryRules: BoundaryRules;
    readonly freezeIntegrityRole: FreezeIntegrityValidatorRole;
    readonly driftDetectorRole: DriftDetectorRole;
    readonly evidenceCollectorRole: EvidenceCollectorRole;
    readonly healthReporterRole: HealthReporterRole;
    readonly validationRecorderRole: ValidationRecorderRole;

    constructor(props: ArchitectureValidationLayerProps) {
        this.identity = Object.freeze({ ...props.identity });
        this.metadata = Object.freeze({ ...props.metadata });
        this.authorityBoundary = props.authorityBoundary;
        this.readWriteBoundary = props.readWriteBoundary;
        this.canonicalSourceModel = props.canonicalSourceModel;
        this.implementationMetadataScope = props.implementationMetadataScope;
        this.validationRules = props.validationRules;
        this.hashPipeline = props.hashPipeline;
        this.ruleEngineRole = props.ruleEngineRole;
        this.contractValidatorRole = props.contractValidatorRole;
        this.boundaryValidatorRole = props.boundaryValidatorRole;
        this.boundaryRules = props.boundaryRules;
        this.freezeIntegrityRole = props.freezeIntegrityRole;
        this.driftDetectorRole = props.driftDetectorRole;
        this.evidenceCollectorRole = props.evidenceCollectorRole;
        this.healthReporterRole = props.healthReporterRole;
        this.validationRecorderRole = props.validationRecorderRole;
        Object.freeze(this);
    }
}
