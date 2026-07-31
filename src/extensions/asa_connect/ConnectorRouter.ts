/**
 * ASA-ARCH-37.0 - Connector Router Contract (Draft 0.3)
 *
 * Endpoint / Connection selection declaration only.
 * Not a decision layer — forbids workflow / policy selection.
 */

/**
 * Connector Routing Contract.
 */
export interface ConnectorRouterContract {
    readonly routerId: string;
    readonly responsibility: "ENDPOINT_AND_CONNECTION_SELECTION";
    readonly permitsEndpointSelection: true;
    readonly permitsConnectionSelection: true;
    readonly forbidsWorkflowSelection: true;
    readonly forbidsPolicyDecision: true;
    readonly isNotDecisionLayer: true;
}

export function freezeConnectorRouterContract(
    contract: ConnectorRouterContract
): ConnectorRouterContract {
    return Object.freeze({ ...contract });
}
