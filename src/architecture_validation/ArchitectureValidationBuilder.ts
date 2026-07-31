/**
 * ASA-ARCH-43.0 - Architecture Validation Intelligence Builder (Draft 0.7)
 *
 * Establishes immutable Architecture Validation Intelligence Layer.
 * Does NOT mutate Core, Frozen Contracts, or Chapters 1–42.
 * No decision / repair / freeze approval authority.
 */

import {
    ArchitectureValidationLayer,
    type ArchitectureValidationLayerMetadata,
} from "./ArchitectureValidationLayer";
import type {
    CanonicalSourceModel,
    ImplementationMetadataScope,
    ValidationAuthorityBoundary,
    ValidationReadWriteBoundary,
} from "./ArchitectureValidationTypes";
import { freezeHashIntegrityPipeline } from "./HashIntegrity";
import { freezeValidationRuleSet } from "./ValidationRules";
import { freezeValidationRuleEngineRole } from "./ValidationRuleEngine";
import { freezeContractValidatorRole } from "./ContractValidator";
import {
    freezeBoundaryRules,
    freezeBoundaryValidatorRole,
} from "./BoundaryValidator";
import { freezeFreezeIntegrityValidatorRole } from "./FreezeIntegrityValidator";
import { freezeDriftDetectorRole } from "./DriftDetector";
import {
    freezeEvidenceCollectorRole,
    freezeHealthReporterRole,
    freezeValidationRecorderRole,
} from "./EvidenceHealthRecorder";

const ARCH = "ASA-ARCH-43.0" as const;
const CORE = "ASA-CORE-34.0" as const;
const SCHEMA = "1.0.0";

function freezeAuthorityBoundary(): ValidationAuthorityBoundary {
    return Object.freeze({
        authority: "VALIDATION_ANALYST" as const,
        finalAuthority: "HUMAN_ARCHITECT" as const,
        validationIsNotModificationAuthority: true as const,
        validationResultIsNotDecisionAuthority: true as const,
        recommendationIsNotDecision: true as const,
        recordIsNotCorrectionAuthority: true as const,
        forbidsModifyCore: true as const,
        forbidsModifyFrozenContract: true as const,
        forbidsRepairAutomatically: true as const,
        forbidsChangeArchitectureState: true as const,
        forbidsApproveFreeze: true as const,
        forbidsApproveChange: true as const,
        forbidsRejectChange: true as const,
        forbidsTriggerModification: true as const,
        forbidsOperationalControl: true as const,
        allowsValidate: true as const,
        allowsDetect: true as const,
        allowsReport: true as const,
        allowsRecommend: true as const,
    });
}

function freezeReadWriteBoundary(): ValidationReadWriteBoundary {
    return Object.freeze({
        architectureSourceAccess: "READ_ONLY" as const,
        readableSources: Object.freeze([
            "CORE_CONTRACT",
            "EXTENSION_CONTRACT",
            "CONNECTOR_CONTRACT",
            "REGISTRATION_RECORD",
            "FREEZE_RECORD",
            "FROZEN_ARCHITECTURE_RECORD",
            "EVOLUTION_RECORD",
            "IMPLEMENTATION_METADATA",
            "VALIDATION_RULE_DEFINITION",
            "VALIDATION_CONFIGURATION",
            "VALIDATION_VERSION_REGISTRY",
        ] as const),
        writableArtifacts: Object.freeze([
            "VALIDATION_REPORT",
            "INTEGRITY_REPORT",
            "DRIFT_REPORT",
            "ARCHITECTURE_HEALTH_REPORT",
            "VALIDATION_EVIDENCE_RECORD",
            "AUDIT_RECORD",
        ] as const),
        forbidsArchitectureSourceWrite: true as const,
    });
}

function freezeCanonicalSourceModel(): CanonicalSourceModel {
    return Object.freeze({
        canonicalSources: Object.freeze([
            "FROZEN_CONTRACT",
            "REGISTERED_ARCHITECTURE_SNAPSHOT",
            "IMPLEMENTATION_EVIDENCE",
        ] as const),
        validationEvidenceSeparatedFromCanonicalSource: true as const,
        validationTargetMustReferenceCanonicalSource: true as const,
    });
}

function freezeImplementationMetadataScope(): ImplementationMetadataScope {
    return Object.freeze({
        allowsExistenceVerification: true as const,
        allowsVersionVerification: true as const,
        allowsArtifactHashVerification: true as const,
        allowsRegistrationAlignmentVerification: true as const,
        forbidsImplementationLogicEvaluation: true as const,
        forbidsCodeQualityJudgment: true as const,
        forbidsBusinessLogicReview: true as const,
        forbidsAutomaticCodeCorrection: true as const,
        implementationDriftIsMetadataAlignmentOnly: true as const,
    });
}

export class ArchitectureValidationBuilder {
    private layerId = "asa-arch-43.0";
    private creationTimestamp?: string;
    private producerIdentity?: string;

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

    establish(): ArchitectureValidationLayer {
        const authorityBoundary = freezeAuthorityBoundary();
        if (
            !authorityBoundary.forbidsRepairAutomatically ||
            !authorityBoundary.forbidsApproveFreeze ||
            !authorityBoundary.validationIsNotModificationAuthority
        ) {
            throw new Error("Authority isolation violated");
        }

        const metadata: ArchitectureValidationLayerMetadata = Object.freeze({
            architectureVersion: ARCH,
            schemaVersion: SCHEMA,
            draft: "0.7" as const,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesFrozenContracts: true as const,
            preservesExtensionContracts: true as const,
            preservesConnectorContracts: true as const,
            preservesChapters1Through42: true as const,
            creationTimestamp: this.creationTimestamp,
            producerIdentity: this.producerIdentity,
        });

        return new ArchitectureValidationLayer({
            identity: Object.freeze({
                layerId: this.layerId,
                layerName: "Architecture Validation Intelligence Layer" as const,
                coreVersion: CORE,
            }),
            metadata,
            authorityBoundary,
            readWriteBoundary: freezeReadWriteBoundary(),
            canonicalSourceModel: freezeCanonicalSourceModel(),
            implementationMetadataScope: freezeImplementationMetadataScope(),
            validationRules: freezeValidationRuleSet(),
            hashPipeline: freezeHashIntegrityPipeline(),
            ruleEngineRole: freezeValidationRuleEngineRole(),
            contractValidatorRole: freezeContractValidatorRole(),
            boundaryValidatorRole: freezeBoundaryValidatorRole(),
            boundaryRules: freezeBoundaryRules(),
            freezeIntegrityRole: freezeFreezeIntegrityValidatorRole(),
            driftDetectorRole: freezeDriftDetectorRole(),
            evidenceCollectorRole: freezeEvidenceCollectorRole(),
            healthReporterRole: freezeHealthReporterRole(),
            validationRecorderRole: freezeValidationRecorderRole(),
        });
    }
}
