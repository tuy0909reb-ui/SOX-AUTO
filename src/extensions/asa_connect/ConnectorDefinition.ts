/**
 * ASA-ARCH-37.0 - Connector Definition Model (Draft 0.3)
 *
 * Declarative connection abstraction only.
 * Connector is not a Capability Provider and holds no Execution Authority.
 */

/** Connector types. */
export type ConnectorType = "API" | "DATABASE" | "FILE" | "NOTIFICATION";

/**
 * Connector Definition — connection abstraction metadata.
 */
export interface ConnectorDefinition {
    readonly id: string;
    readonly type: ConnectorType;
    readonly version: string;
    readonly endpoint: string;
    readonly capabilities: ReadonlyArray<string>;
    readonly validationRules: ReadonlyArray<string>;
    readonly securityPolicy: string;
    readonly responsibility: "EXTERNAL_CONNECTION_MANAGEMENT";
    readonly forbidsBusinessDecision: true;
    readonly forbidsPolicyDecision: true;
    readonly forbidsExecutionDecision: true;
    readonly isNotCapabilityProvider: true;
}

export function freezeConnectorDefinition(
    definition: ConnectorDefinition
): ConnectorDefinition {
    return Object.freeze({
        ...definition,
        capabilities: Object.freeze([...definition.capabilities]),
        validationRules: Object.freeze([...definition.validationRules]),
    });
}
