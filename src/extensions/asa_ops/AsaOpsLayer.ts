/**
 * ASA-ARCH-36.0 - ASA-OPS Operational Extension Layer model (Draft 0.4)
 *
 * Immutable aggregate of OPS domain contracts.
 * System Observability Provider — not an Execution subject.
 *
 * SHALL NOT contain runtime observation, logging engines,
 * scheduling, or execution-control semantics.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import type { OpsAuditContract } from "./OpsAudit";
import type { OpsExecutionTraceContract } from "./OpsExecutionTrace";
import type { OpsExtensionContract } from "./OpsExtensionContract";
import type { OpsHealthContract } from "./OpsHealth";
import type { OpsLoggingContract } from "./OpsLogger";
import type { OpsMonitoringContract } from "./OpsMonitoring";
import type { OpsObservationContract } from "./OpsObservation";
import type { OpsReportingContract } from "./OpsReporting";

/** Stable OPS layer identity. */
export type AsaOpsLayerId = string;

/**
 * Security Boundary declaration (structural).
 * OPS holds no Secret / Execution / Policy authority.
 */
export interface OpsSecurityBoundary {
    readonly holdsSecretReadAuthority: false;
    readonly holdsSecretMutationAuthority: false;
    readonly holdsExecutionAuthority: false;
    readonly holdsPolicyAuthority: false;
    readonly accessMode: "READ_ONLY_FIRST";
}

/**
 * Extension Interaction Contract (structural).
 */
export interface OpsExtensionInteractionContract {
    readonly requiresAuthorityValidation: true;
    readonly requiresCompatibilityValidation: true;
    readonly requiresBoundaryContract: true;
    readonly forbidsCoreInternalMutation: true;
    readonly forbidsDirectExtensionInternalAccess: true;
    readonly permitsAiAuditRequest: true;
    readonly permitsConnectEventNotification: true;
    readonly permitsSelfObservation: true;
}

/**
 * Structural metadata only.
 */
export interface AsaOpsLayerMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesGovernanceContract: true;
    readonly preservesFrameworkContract: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Immutable OPS Operational Extension Layer.
 */
export interface AsaOpsLayerProps {
    readonly identity: {
        readonly layerId: AsaOpsLayerId;
        readonly extensionId: "ASA-OPS";
        readonly coreVersion: "ASA-CORE-34.0";
        readonly architectureVersion: string;
        readonly structuralVersion: string;
        readonly sourceFrameworkId: string;
    };
    readonly metadata: AsaOpsLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: OpsExtensionContract;
    readonly observation: OpsObservationContract;
    readonly logging: OpsLoggingContract;
    readonly audit: OpsAuditContract;
    readonly monitoring: OpsMonitoringContract;
    readonly health: OpsHealthContract;
    readonly reporting: OpsReportingContract;
    readonly executionTrace: OpsExecutionTraceContract;
    readonly securityBoundary: OpsSecurityBoundary;
    readonly interactionContract: OpsExtensionInteractionContract;
}

/**
 * Immutable ASA-OPS Operational Extension Layer.
 */
export class AsaOpsLayer implements AsaOpsLayerProps {
    readonly identity: AsaOpsLayerProps["identity"];
    readonly metadata: AsaOpsLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: OpsExtensionContract;
    readonly observation: OpsObservationContract;
    readonly logging: OpsLoggingContract;
    readonly audit: OpsAuditContract;
    readonly monitoring: OpsMonitoringContract;
    readonly health: OpsHealthContract;
    readonly reporting: OpsReportingContract;
    readonly executionTrace: OpsExecutionTraceContract;
    readonly securityBoundary: OpsSecurityBoundary;
    readonly interactionContract: OpsExtensionInteractionContract;

    /**
     * Package-internal constructor.
     * Prefer OpsValidator.establish().
     */
    constructor(init: AsaOpsLayerProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceFramework = init.sourceFramework;
        this.extensionContract = init.extensionContract;
        this.observation = init.observation;
        this.logging = init.logging;
        this.audit = init.audit;
        this.monitoring = init.monitoring;
        this.health = init.health;
        this.reporting = init.reporting;
        this.executionTrace = init.executionTrace;
        this.securityBoundary = Object.freeze({ ...init.securityBoundary });
        this.interactionContract = Object.freeze({
            ...init.interactionContract,
        });
        Object.freeze(this);
    }
}
