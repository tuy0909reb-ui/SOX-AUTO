/**
 * ASA-ARCH-36.0 - ASA-OPS Validator / Establishment Builder (Draft 0.4)
 *
 * Establishes the immutable ASA-OPS Operational Extension Layer.
 * Consumes frozen ASA-ARCH-35.1 Extension Development Framework by reference.
 * Does NOT mutate Core, Governance, or Framework contracts.
 *
 * Performs structural validation only — not a runtime validator engine.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import {
    AsaOpsLayer,
    type AsaOpsLayerMetadata,
    type OpsExtensionInteractionContract,
    type OpsSecurityBoundary,
} from "./AsaOpsLayer";
import {
    freezeOpsAuditContract,
    type OpsAuditContract,
} from "./OpsAudit";
import {
    freezeOpsExecutionTraceContract,
    type OpsExecutionTraceContract,
    type OpsExecutionTraceStage,
} from "./OpsExecutionTrace";
import {
    freezeOpsExtensionContract,
    type OpsExtensionContract,
} from "./OpsExtensionContract";
import {
    freezeOpsHealthContract,
    type OpsHealthContract,
    type OpsHealthStatus,
} from "./OpsHealth";
import {
    freezeOpsLoggingContract,
    type OpsLogEventKind,
    type OpsLoggingContract,
} from "./OpsLogger";
import {
    freezeOpsMonitoringContract,
    type OpsMonitoringContract,
    type OpsMonitoringTargetKind,
} from "./OpsMonitoring";
import {
    freezeOpsObservationContract,
    type OpsObservationContract,
    type OpsObservationTargetKind,
} from "./OpsObservation";
import {
    freezeOpsReportingContract,
    type OpsReportingContract,
    type OpsReportingInputKind,
    type OpsReportingOutputKind,
} from "./OpsReporting";

const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const REQUIRED_FRAMEWORK_ARCH = "ASA-ARCH-35.1";
const REQUIRED_TRACE_STAGES: ReadonlyArray<OpsExecutionTraceStage> = [
    "REQUEST",
    "EXTENSION_IDENTIFIER",
    "EXTENSION_BOUNDARY",
    "WORKFLOW",
    "CAPABILITY",
    "EXECUTION",
    "RESULT",
];
const REQUIRED_HEALTH_STATUSES: ReadonlyArray<OpsHealthStatus> = [
    "Healthy",
    "Warning",
    "Critical",
    "Unavailable",
];
const REQUIRED_LOG_EVENTS: ReadonlyArray<OpsLogEventKind> = [
    "EXECUTION_EVENT",
    "WORKFLOW_EVENT",
    "EXTENSION_EVENT",
    "ERROR_EVENT",
    "SECURITY_EVENT",
];
const REQUIRED_OBSERVATION_TARGETS: ReadonlyArray<OpsObservationTargetKind> = [
    "CORE",
    "WORKFLOW",
    "CAPABILITY",
    "EXTENSION",
    "RUNTIME_STATE",
    "OPERATIONAL_METRICS",
];
const REQUIRED_MONITORING_TARGETS: ReadonlyArray<OpsMonitoringTargetKind> = [
    "CORE_HEALTH",
    "EXTENSION_HEALTH",
    "RUNTIME_HEALTH",
    "PERFORMANCE_METRICS",
    "LATENCY",
    "AVAILABILITY",
    "FAILURE_RATE",
    "RESOURCE_USAGE",
];
const REQUIRED_REPORTING_INPUTS: ReadonlyArray<OpsReportingInputKind> = [
    "HEALTH",
    "AUDIT",
    "MONITORING",
];
const REQUIRED_REPORTING_OUTPUTS: ReadonlyArray<OpsReportingOutputKind> = [
    "HEALTH_SUMMARY",
    "AUDIT_SUMMARY",
    "MONITORING_SUMMARY",
    "OPERATIONAL_METRICS",
];

/**
 * Structural validator that establishes the ASA-OPS Operational Extension Layer.
 */
export class OpsValidator {
    private layerId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceFramework: ExtensionDevelopmentFramework | undefined;
    private extensionContract: OpsExtensionContract | undefined;
    private observation: OpsObservationContract | undefined;
    private logging: OpsLoggingContract | undefined;
    private audit: OpsAuditContract | undefined;
    private monitoring: OpsMonitoringContract | undefined;
    private health: OpsHealthContract | undefined;
    private reporting: OpsReportingContract | undefined;
    private executionTrace: OpsExecutionTraceContract | undefined;

    withLayerId(layerId: string): this {
        this.layerId = layerId;
        return this;
    }

    withArchitectureVersion(architectureVersion: string): this {
        this.architectureVersion = architectureVersion;
        return this;
    }

    withStructuralVersion(structuralVersion: string): this {
        this.structuralVersion = structuralVersion;
        return this;
    }

    withSchemaVersion(schemaVersion: string): this {
        this.schemaVersion = schemaVersion;
        return this;
    }

    withCreationTimestamp(creationTimestamp: string): this {
        this.creationTimestamp = creationTimestamp;
        return this;
    }

    withProducerIdentity(producerIdentity: string): this {
        this.producerIdentity = producerIdentity;
        return this;
    }

    /**
     * Supplies exactly one frozen ASA-ARCH-35.1 Framework by reference.
     */
    withSourceFramework(sourceFramework: ExtensionDevelopmentFramework): this {
        this.sourceFramework = sourceFramework;
        return this;
    }

    withExtensionContract(extensionContract: OpsExtensionContract): this {
        this.extensionContract = extensionContract;
        return this;
    }

    withObservation(observation: OpsObservationContract): this {
        this.observation = observation;
        return this;
    }

    withLogging(logging: OpsLoggingContract): this {
        this.logging = logging;
        return this;
    }

    withAudit(audit: OpsAuditContract): this {
        this.audit = audit;
        return this;
    }

    withMonitoring(monitoring: OpsMonitoringContract): this {
        this.monitoring = monitoring;
        return this;
    }

    withHealth(health: OpsHealthContract): this {
        this.health = health;
        return this;
    }

    withReporting(reporting: OpsReportingContract): this {
        this.reporting = reporting;
        return this;
    }

    withExecutionTrace(executionTrace: OpsExecutionTraceContract): this {
        this.executionTrace = executionTrace;
        return this;
    }

    /**
     * Establishes the immutable ASA-OPS layer after structural validation.
     */
    establish(): AsaOpsLayer {
        const layerId = this.requireNonEmpty(this.layerId, "layerId");
        const architectureVersion = this.requireNonEmpty(
            this.architectureVersion,
            "architectureVersion"
        );
        const structuralVersion = this.requireNonEmpty(
            this.structuralVersion,
            "structuralVersion"
        );
        const schemaVersion = this.requireNonEmpty(
            this.schemaVersion,
            "schemaVersion"
        );

        if (!this.sourceFramework) {
            throw new Error(
                "ASA-OPS establishment failed: exactly one source Extension Development Framework is required"
            );
        }

        const framework = this.sourceFramework;

        if (!Object.isFrozen(framework)) {
            throw new Error(
                "ASA-OPS establishment failed: source Framework immutability verification failed"
            );
        }

        if (!Object.isFrozen(framework.identity)) {
            throw new Error(
                "ASA-OPS establishment failed: source Framework identity immutability verification failed"
            );
        }

        if (framework.identity.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ASA-OPS establishment failed: Framework must preserve ASA-CORE-34.0"
            );
        }

        if (
            framework.identity.architectureVersion !== REQUIRED_FRAMEWORK_ARCH &&
            framework.metadata.architectureVersion !== REQUIRED_FRAMEWORK_ARCH
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Framework must be ASA-ARCH-35.1"
            );
        }

        if (framework.metadata.frameworkStatus !== "defined") {
            throw new Error(
                "ASA-OPS establishment failed: Framework status must be defined"
            );
        }

        if (!this.extensionContract) {
            throw new Error(
                "ASA-OPS establishment failed: OpsExtensionContract is required"
            );
        }
        if (!this.observation) {
            throw new Error(
                "ASA-OPS establishment failed: Observation Contract is required"
            );
        }
        if (!this.logging) {
            throw new Error(
                "ASA-OPS establishment failed: Logging Contract is required"
            );
        }
        if (!this.audit) {
            throw new Error(
                "ASA-OPS establishment failed: Audit Contract is required"
            );
        }
        if (!this.monitoring) {
            throw new Error(
                "ASA-OPS establishment failed: Monitoring Contract is required"
            );
        }
        if (!this.health) {
            throw new Error(
                "ASA-OPS establishment failed: Health Contract is required"
            );
        }
        if (!this.reporting) {
            throw new Error(
                "ASA-OPS establishment failed: Reporting Contract is required"
            );
        }
        if (!this.executionTrace) {
            throw new Error(
                "ASA-OPS establishment failed: Execution Trace Contract is required"
            );
        }

        this.validateExtensionContract(this.extensionContract);
        this.validateObservation(this.observation);
        this.validateLogging(this.logging);
        this.validateAudit(this.audit);
        this.validateMonitoring(this.monitoring);
        this.validateHealth(this.health);
        this.validateReporting(this.reporting);
        this.validateExecutionTrace(this.executionTrace);

        const securityBoundary: OpsSecurityBoundary = Object.freeze({
            holdsSecretReadAuthority: false as const,
            holdsSecretMutationAuthority: false as const,
            holdsExecutionAuthority: false as const,
            holdsPolicyAuthority: false as const,
            accessMode: "READ_ONLY_FIRST" as const,
        });

        const interactionContract: OpsExtensionInteractionContract =
            Object.freeze({
                requiresAuthorityValidation: true as const,
                requiresCompatibilityValidation: true as const,
                requiresBoundaryContract: true as const,
                forbidsCoreInternalMutation: true as const,
                forbidsDirectExtensionInternalAccess: true as const,
                permitsAiAuditRequest: true as const,
                permitsConnectEventNotification: true as const,
                permitsSelfObservation: true as const,
            });

        const metadata: AsaOpsLayerMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesGovernanceContract: true as const,
            preservesFrameworkContract: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new AsaOpsLayer({
            identity: Object.freeze({
                layerId,
                extensionId: "ASA-OPS" as const,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
                sourceFrameworkId: framework.identity.frameworkId,
            }),
            metadata,
            sourceFramework: framework,
            extensionContract: freezeOpsExtensionContract(
                this.extensionContract
            ),
            observation: freezeOpsObservationContract(this.observation),
            logging: freezeOpsLoggingContract(this.logging),
            audit: freezeOpsAuditContract(this.audit),
            monitoring: freezeOpsMonitoringContract(this.monitoring),
            health: freezeOpsHealthContract(this.health),
            reporting: freezeOpsReportingContract(this.reporting),
            executionTrace: freezeOpsExecutionTraceContract(
                this.executionTrace
            ),
            securityBoundary,
            interactionContract,
        });
    }

    private validateExtensionContract(contract: OpsExtensionContract): void {
        if (contract.id !== "ASA-OPS") {
            throw new Error(
                "ASA-OPS establishment failed: Extension Identifier must be ASA-OPS"
            );
        }
        this.requireNonEmpty(contract.version, "extensionContract.version");
        if (contract.domain !== "Operational") {
            throw new Error(
                "ASA-OPS establishment failed: domain must be Operational"
            );
        }
        if (contract.frameworkDomain !== "OPS") {
            throw new Error(
                "ASA-OPS establishment failed: frameworkDomain must be OPS"
            );
        }
        if (contract.authority !== "OBSERVER") {
            throw new Error(
                "ASA-OPS establishment failed: Authority Declaration must be OBSERVER"
            );
        }
        this.requireNonEmpty(
            contract.description,
            "extensionContract.description"
        );
        this.requireNonEmpty(
            contract.governanceOwner,
            "extensionContract.governanceOwner"
        );
        if (
            !contract.compatibility ||
            contract.compatibility.length === 0 ||
            !contract.compatibility.includes(REQUIRED_CORE_VERSION) ||
            !contract.compatibility.includes("ASA-ARCH-35.x") ||
            !contract.compatibility.includes("ASA-ARCH-35.1")
        ) {
            throw new Error(
                "ASA-OPS establishment failed: compatibility must include ASA-CORE-34.0, ASA-ARCH-35.x, ASA-ARCH-35.1"
            );
        }
        if (
            contract.forbidsDecisionMaking !== true ||
            contract.forbidsExecutionTrigger !== true ||
            contract.forbidsWorkflowModification !== true ||
            contract.forbidsPolicyModification !== true ||
            contract.forbidsCoreMutation !== true ||
            contract.forbidsGovernanceMutation !== true ||
            contract.forbidsRegistryMutation !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Authority / Core Preservation forbid flags must all be true"
            );
        }
        if (
            contract.permitsReadContext !== true ||
            contract.permitsCollectMetrics !== true ||
            contract.permitsGenerateLogs !== true ||
            contract.permitsCreateAuditRecords !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: OBSERVER permitted operations must all be true"
            );
        }
    }

    private validateObservation(contract: OpsObservationContract): void {
        this.requireNonEmpty(contract.observationId, "observation.observationId");
        this.requireAllPresent(
            contract.targets,
            REQUIRED_OBSERVATION_TARGETS,
            "Observation targets"
        );
        if (
            contract.observationOnly !== true ||
            contract.forbidsStateMutation !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Observation must be observation-only without state mutation"
            );
        }
    }

    private validateLogging(contract: OpsLoggingContract): void {
        this.requireNonEmpty(contract.loggingId, "logging.loggingId");
        if (contract.responsibility !== "RUNTIME_EVENT_RECORD") {
            throw new Error(
                "ASA-OPS establishment failed: Logging responsibility must be RUNTIME_EVENT_RECORD"
            );
        }
        this.requireAllPresent(
            contract.eventKinds,
            REQUIRED_LOG_EVENTS,
            "Logging event kinds"
        );
        const shape = contract.recordShape;
        if (
            shape.immutableRecord !== true ||
            shape.requiresTimestamp !== true ||
            shape.requiresSourceIdentification !== true ||
            shape.requiresCorrelationId !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Logging record shape flags must all be true"
            );
        }
    }

    private validateAudit(contract: OpsAuditContract): void {
        this.requireNonEmpty(contract.auditId, "audit.auditId");
        if (contract.responsibility !== "OPERATIONAL_ACCOUNTABILITY_RECORD") {
            throw new Error(
                "ASA-OPS establishment failed: Audit responsibility must be OPERATIONAL_ACCOUNTABILITY_RECORD"
            );
        }
        if (contract.purpose !== "REPRODUCE_STATE") {
            throw new Error(
                "ASA-OPS establishment failed: Audit purpose must be REPRODUCE_STATE"
            );
        }
        if (contract.immutableRecord !== true) {
            throw new Error(
                "ASA-OPS establishment failed: Audit Integrity requires immutableRecord"
            );
        }
        const fields = contract.requiredFields;
        if (
            fields.decisionAuthority !== true ||
            fields.decisionSource !== true ||
            fields.who !== true ||
            fields.what !== true ||
            fields.when !== true ||
            fields.why !== true ||
            fields.executionResult !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Audit required fields incomplete"
            );
        }
    }

    private validateMonitoring(contract: OpsMonitoringContract): void {
        this.requireNonEmpty(contract.monitoringId, "monitoring.monitoringId");
        if (contract.responsibility !== "RUNTIME_OBSERVATION") {
            throw new Error(
                "ASA-OPS establishment failed: Monitoring responsibility must be RUNTIME_OBSERVATION"
            );
        }
        this.requireAllPresent(
            contract.targets,
            REQUIRED_MONITORING_TARGETS,
            "Monitoring targets"
        );
        if (contract.forbidsStateMutation !== true) {
            throw new Error(
                "ASA-OPS establishment failed: Monitoring must forbid state mutation"
            );
        }
    }

    private validateHealth(contract: OpsHealthContract): void {
        this.requireNonEmpty(contract.healthId, "health.healthId");
        this.requireAllPresent(
            contract.allowedStatuses,
            REQUIRED_HEALTH_STATUSES,
            "Health statuses"
        );
        if (
            contract.statusIsObservationResult !== true ||
            contract.forbidsExecutionPermissionChange !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Health Status must be observation-only and must not alter Execution Permission"
            );
        }
    }

    private validateReporting(contract: OpsReportingContract): void {
        this.requireNonEmpty(contract.reportingId, "reporting.reportingId");
        if (contract.responsibility !== "OPERATIONAL_STATUS_REPORTING") {
            throw new Error(
                "ASA-OPS establishment failed: Reporting responsibility must be OPERATIONAL_STATUS_REPORTING"
            );
        }
        this.requireAllPresent(
            contract.inputs,
            REQUIRED_REPORTING_INPUTS,
            "Reporting inputs"
        );
        this.requireAllPresent(
            contract.outputs,
            REQUIRED_REPORTING_OUTPUTS,
            "Reporting outputs"
        );
        if (
            contract.displayAndNotificationOnly !== true ||
            contract.forbidsRuntimeStateMutation !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Reporting must be display/notification only without Runtime mutation"
            );
        }
    }

    private validateExecutionTrace(
        contract: OpsExecutionTraceContract
    ): void {
        this.requireNonEmpty(contract.traceId, "executionTrace.traceId");
        if (contract.purpose !== "EXECUTION_PATH_VISIBILITY") {
            throw new Error(
                "ASA-OPS establishment failed: Execution Trace purpose must be EXECUTION_PATH_VISIBILITY"
            );
        }
        if (
            !contract.stages ||
            contract.stages.length !== REQUIRED_TRACE_STAGES.length ||
            REQUIRED_TRACE_STAGES.some((s, i) => contract.stages[i] !== s)
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Execution Trace stages are incomplete or out of order"
            );
        }
        if (
            contract.observationOnly !== true ||
            contract.forbidsExecutionControl !== true
        ) {
            throw new Error(
                "ASA-OPS establishment failed: Execution Trace must be observation-only without Execution Control"
            );
        }
    }

    private requireAllPresent<T extends string>(
        actual: ReadonlyArray<T>,
        required: ReadonlyArray<T>,
        label: string
    ): void {
        for (const item of required) {
            if (!actual.includes(item)) {
                throw new Error(
                    `ASA-OPS establishment failed: ${label} missing ${item}`
                );
            }
        }
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ASA-OPS establishment failed: ${field} is required`
            );
        }
        return value;
    }
}
