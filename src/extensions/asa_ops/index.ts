/**
 * ASA-ARCH-36.0 - ASA-OPS Operational Extension Layer (Draft 0.4)
 *
 * Public package exports.
 */

export {
    AsaOpsLayer,
    type AsaOpsLayerId,
    type AsaOpsLayerMetadata,
    type AsaOpsLayerProps,
    type OpsExtensionInteractionContract,
    type OpsSecurityBoundary,
} from "./AsaOpsLayer";
export {
    freezeOpsAuditContract,
    type OpsAuditContract,
    type OpsAuditRecordFields,
} from "./OpsAudit";
export {
    freezeOpsExecutionTraceContract,
    type OpsExecutionTraceContract,
    type OpsExecutionTraceStage,
} from "./OpsExecutionTrace";
export {
    freezeOpsExtensionContract,
    type AsaOpsDomainLabel,
    type AsaOpsExtensionId,
    type AsaOpsFrameworkDomain,
    type OpsExtensionContract,
} from "./OpsExtensionContract";
export {
    freezeOpsHealthContract,
    type OpsHealthContract,
    type OpsHealthStatus,
} from "./OpsHealth";
export {
    freezeOpsLoggingContract,
    type OpsLogEventKind,
    type OpsLogRecordShape,
    type OpsLoggingContract,
} from "./OpsLogger";
export {
    freezeOpsMonitoringContract,
    type OpsMonitoringContract,
    type OpsMonitoringTargetKind,
} from "./OpsMonitoring";
export {
    freezeOpsObservationContract,
    type OpsObservationContract,
    type OpsObservationTargetKind,
} from "./OpsObservation";
export {
    freezeOpsReportingContract,
    type OpsReportingContract,
    type OpsReportingInputKind,
    type OpsReportingOutputKind,
} from "./OpsReporting";
export { OpsValidator } from "./OpsValidator";
