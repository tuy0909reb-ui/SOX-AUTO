/**
 * ASA-ARCH-37.0 - Connector Error Contract (Draft 0.3)
 *
 * Converts external errors into ASA internal error classifications.
 * Declarative classification only — not an error-handling engine.
 */

/** External error sources. */
export type ConnectorExternalErrorKind =
    | "TIMEOUT"
    | "AUTHENTICATION_FAILURE"
    | "RATE_LIMIT"
    | "SCHEMA_MISMATCH"
    | "EXTERNAL_SERVICE_FAILURE"
    | "CONNECTION_FAILURE";

/** ASA-facing error classifications. */
export type ConnectorErrorClassification =
    | "TRANSIENT_ERROR"
    | "PERMANENT_ERROR"
    | "SECURITY_ERROR"
    | "VALIDATION_ERROR";

/**
 * Connector Error Contract.
 */
export interface ConnectorErrorContract {
    readonly errorContractId: string;
    readonly externalErrorKinds: ReadonlyArray<ConnectorExternalErrorKind>;
    readonly classifications: ReadonlyArray<ConnectorErrorClassification>;
    readonly pipeline: ReadonlyArray<
        | "EXTERNAL_ERROR"
        | "CONNECTOR_ERROR_CONTRACT"
        | "ASA_ERROR_HANDLING"
    >;
}

export function freezeConnectorErrorContract(
    contract: ConnectorErrorContract
): ConnectorErrorContract {
    return Object.freeze({
        ...contract,
        externalErrorKinds: Object.freeze([...contract.externalErrorKinds]),
        classifications: Object.freeze([...contract.classifications]),
        pipeline: Object.freeze([...contract.pipeline]),
    });
}
