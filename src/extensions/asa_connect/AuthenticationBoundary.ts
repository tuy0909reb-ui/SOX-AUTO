/**
 * ASA-ARCH-37.0 - Authentication Boundary + Secret Protection (Draft 0.3)
 *
 * Secrets remain inside Connector boundary.
 * Secret Handling Boundary ≠ Secret Ownership.
 */

/** Authentication material kinds (references only — no secret values). */
export type AuthenticationMaterialKind =
    | "API_KEY"
    | "TOKEN"
    | "CREDENTIAL"
    | "SECRET_REFERENCE";

/**
 * Authentication Boundary Contract.
 */
export interface AuthenticationBoundary {
    readonly boundaryId: string;
    readonly materialKinds: ReadonlyArray<AuthenticationMaterialKind>;
    readonly secretsRemainInsideConnectorBoundary: true;
    readonly forbidsSecretToCoreContract: true;
    readonly forbidsSecretToExtensionOutput: true;
}

/**
 * Secret Protection Contract — handling boundary without ownership.
 */
export interface SecretProtectionContract {
    readonly protectionId: string;
    readonly providesSecretHandlingBoundary: true;
    readonly isNotSecretOwnership: true;
    readonly creationDelegatedExternally: true;
    readonly rotationDelegatedExternally: true;
    readonly expirationDelegatedExternally: true;
    readonly revocationDelegatedExternally: true;
    readonly usageLimitedToConnectorConnection: true;
}

export function freezeAuthenticationBoundary(
    boundary: AuthenticationBoundary
): AuthenticationBoundary {
    return Object.freeze({
        ...boundary,
        materialKinds: Object.freeze([...boundary.materialKinds]),
    });
}

export function freezeSecretProtectionContract(
    contract: SecretProtectionContract
): SecretProtectionContract {
    return Object.freeze({ ...contract });
}
