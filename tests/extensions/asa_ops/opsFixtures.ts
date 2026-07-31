import { ExtensionGovernanceBuilder } from "../../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFrameworkBuilder } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";
import type { OpsAuditContract } from "../../../src/extensions/asa_ops/OpsAudit";
import type { OpsExecutionTraceContract } from "../../../src/extensions/asa_ops/OpsExecutionTrace";
import type { OpsExtensionContract } from "../../../src/extensions/asa_ops/OpsExtensionContract";
import type { OpsHealthContract } from "../../../src/extensions/asa_ops/OpsHealth";
import type { OpsLoggingContract } from "../../../src/extensions/asa_ops/OpsLogger";
import type { OpsMonitoringContract } from "../../../src/extensions/asa_ops/OpsMonitoring";
import type { OpsObservationContract } from "../../../src/extensions/asa_ops/OpsObservation";
import type { OpsReportingContract } from "../../../src/extensions/asa_ops/OpsReporting";
import { OpsValidator } from "../../../src/extensions/asa_ops/OpsValidator";

function sampleBoundaryContract(): ExtensionBoundaryContract {
    return Object.freeze({
        contractId: "ext.boundary.contract.v1",
        coreVersion: "ASA-CORE-34.0",
        architectureVersion: "ASA-ARCH-35.0",
        structuralVersion: "0.3",
        isolation: true as const,
        permittedOperationIds: Object.freeze([
            "exchange.context.read",
            "collect.metrics",
            "generate.logs",
            "create.audit.records",
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
        .withGovernanceLayerId("egl-ops")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression())
        .establish();
}

function sampleFrameworkTemplate(): ExtensionTemplateContract {
    return Object.freeze({
        metadata: Object.freeze({
            id: "ASA-OPS",
            version: "1.0.0",
            domain: "OPS" as const,
            description: "OPS development template for ASA-ARCH-36.0",
            governanceOwner: "ASA-GOV-OPS",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.ops.input.v1"]),
            processingBoundaryId: "ext.ops.processing.v1",
            outputContractIds: Object.freeze(["ext.ops.output.v1"]),
            errorContract: Object.freeze({
                errorType: "OPS_FAILURE",
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
        .withFrameworkId("edf-ops")
        .withArchitectureVersion("ASA-ARCH-35.1")
        .withStructuralVersion("0.2")
        .withSchemaVersion("0.2")
        .withSourceGovernanceLayer(establishGovernance())
        .withExtensionTemplate(sampleFrameworkTemplate())
        .define();
}

export function sampleOpsExtensionContract(): OpsExtensionContract {
    return Object.freeze({
        id: "ASA-OPS",
        version: "1.0.0",
        domain: "Operational",
        frameworkDomain: "OPS",
        authority: "OBSERVER",
        compatibility: Object.freeze([
            "ASA-CORE-34.0",
            "ASA-ARCH-35.x",
            "ASA-ARCH-35.1",
        ]),
        description: "ASA-OPS Operational Extension Layer",
        governanceOwner: "ASA-GOV-OPS",
        forbidsDecisionMaking: true,
        forbidsExecutionTrigger: true,
        forbidsWorkflowModification: true,
        forbidsPolicyModification: true,
        forbidsCoreMutation: true,
        forbidsGovernanceMutation: true,
        forbidsRegistryMutation: true,
        permitsReadContext: true,
        permitsCollectMetrics: true,
        permitsGenerateLogs: true,
        permitsCreateAuditRecords: true,
    });
}

export function sampleObservation(): OpsObservationContract {
    return Object.freeze({
        observationId: "ops.observation.v1",
        targets: Object.freeze([
            "CORE",
            "WORKFLOW",
            "CAPABILITY",
            "EXTENSION",
            "RUNTIME_STATE",
            "OPERATIONAL_METRICS",
        ] as const),
        observationOnly: true,
        forbidsStateMutation: true,
    });
}

export function sampleLogging(): OpsLoggingContract {
    return Object.freeze({
        loggingId: "ops.logging.v1",
        responsibility: "RUNTIME_EVENT_RECORD",
        eventKinds: Object.freeze([
            "EXECUTION_EVENT",
            "WORKFLOW_EVENT",
            "EXTENSION_EVENT",
            "ERROR_EVENT",
            "SECURITY_EVENT",
        ] as const),
        recordShape: Object.freeze({
            immutableRecord: true,
            requiresTimestamp: true,
            requiresSourceIdentification: true,
            requiresCorrelationId: true,
        }),
    });
}

export function sampleAudit(): OpsAuditContract {
    return Object.freeze({
        auditId: "ops.audit.v1",
        responsibility: "OPERATIONAL_ACCOUNTABILITY_RECORD",
        purpose: "REPRODUCE_STATE",
        immutableRecord: true,
        requiredFields: Object.freeze({
            decisionAuthority: true,
            decisionSource: true,
            who: true,
            what: true,
            when: true,
            why: true,
            executionResult: true,
        }),
    });
}

export function sampleMonitoring(): OpsMonitoringContract {
    return Object.freeze({
        monitoringId: "ops.monitoring.v1",
        responsibility: "RUNTIME_OBSERVATION",
        purpose: "SYSTEM_WIDE_OPERATIONAL_VISIBILITY",
        targets: Object.freeze([
            "CORE_HEALTH",
            "EXTENSION_HEALTH",
            "RUNTIME_HEALTH",
            "PERFORMANCE_METRICS",
            "LATENCY",
            "AVAILABILITY",
            "FAILURE_RATE",
            "RESOURCE_USAGE",
        ] as const),
        forbidsStateMutation: true,
    });
}

export function sampleHealth(): OpsHealthContract {
    return Object.freeze({
        healthId: "ops.health.v1",
        allowedStatuses: Object.freeze([
            "Healthy",
            "Warning",
            "Critical",
            "Unavailable",
        ] as const),
        statusIsObservationResult: true,
        forbidsExecutionPermissionChange: true,
    });
}

export function sampleReporting(): OpsReportingContract {
    return Object.freeze({
        reportingId: "ops.reporting.v1",
        responsibility: "OPERATIONAL_STATUS_REPORTING",
        inputs: Object.freeze(["HEALTH", "AUDIT", "MONITORING"] as const),
        outputs: Object.freeze([
            "HEALTH_SUMMARY",
            "AUDIT_SUMMARY",
            "MONITORING_SUMMARY",
            "OPERATIONAL_METRICS",
        ] as const),
        displayAndNotificationOnly: true,
        forbidsRuntimeStateMutation: true,
    });
}

export function sampleExecutionTrace(): OpsExecutionTraceContract {
    return Object.freeze({
        traceId: "ops.trace.v1",
        purpose: "EXECUTION_PATH_VISIBILITY",
        stages: Object.freeze([
            "REQUEST",
            "EXTENSION_IDENTIFIER",
            "EXTENSION_BOUNDARY",
            "WORKFLOW",
            "CAPABILITY",
            "EXECUTION",
            "RESULT",
        ] as const),
        observationOnly: true,
        forbidsExecutionControl: true,
    });
}

export function baseOpsValidator(): OpsValidator {
    return new OpsValidator()
        .withLayerId("ops-layer-ok")
        .withArchitectureVersion("ASA-ARCH-36.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withSourceFramework(establishFramework())
        .withExtensionContract(sampleOpsExtensionContract())
        .withObservation(sampleObservation())
        .withLogging(sampleLogging())
        .withAudit(sampleAudit())
        .withMonitoring(sampleMonitoring())
        .withHealth(sampleHealth())
        .withReporting(sampleReporting())
        .withExecutionTrace(sampleExecutionTrace());
}
