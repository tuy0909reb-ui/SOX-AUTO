/**
 * ASA-ARCH-37.0 - Outbound Connector Boundary (Draft 0.3)
 *
 * ASA → Boundary Contract → Connector → External System.
 * Forbids Core → External System direct access.
 */

/** Outbound communication kinds. */
export type OutboundCommunicationKind =
    | "NOTIFICATION_DELIVERY"
    | "EXTERNAL_API_REQUEST"
    | "EXTERNAL_DATA_EXPORT";

/**
 * Outbound Communication Boundary Contract.
 */
export interface OutboundConnectorBoundary {
    readonly boundaryId: string;
    readonly pipeline: ReadonlyArray<
        | "ASA"
        | "BOUNDARY_CONTRACT"
        | "CONNECTOR"
        | "EXTERNAL_SYSTEM"
    >;
    readonly communicationKinds: ReadonlyArray<OutboundCommunicationKind>;
    readonly forbidsCoreDirectExternalAccess: true;
    readonly requiresValidationAndSecurityBoundary: true;
}

export function freezeOutboundConnectorBoundary(
    boundary: OutboundConnectorBoundary
): OutboundConnectorBoundary {
    return Object.freeze({
        ...boundary,
        pipeline: Object.freeze([...boundary.pipeline]),
        communicationKinds: Object.freeze([...boundary.communicationKinds]),
    });
}
