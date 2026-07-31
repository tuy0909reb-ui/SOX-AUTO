/**
 * ASA-ARCH-37.0 - External Request Protection Guard (Draft 0.3)
 *
 * Observation / Validation only — no Decision or Execution Authority.
 */

/** Protection check kinds. */
export type ExternalRequestProtectionKind =
    | "RATE_LIMIT"
    | "REQUEST_VALIDATION"
    | "PAYLOAD_SIZE"
    | "ABUSE_PREVENTION";

/**
 * External Request Guard Contract.
 */
export interface ExternalRequestGuard {
    readonly guardId: string;
    readonly protectionKinds: ReadonlyArray<ExternalRequestProtectionKind>;
    readonly authorityMode: "OBSERVATION_VALIDATION_ONLY";
    readonly forbidsDecisionAuthority: true;
    readonly forbidsExecutionAuthority: true;
    readonly purpose: "EXTERNAL_DEPENDENCY_AND_ASA_BOUNDARY_PROTECTION";
}

export function freezeExternalRequestGuard(
    guard: ExternalRequestGuard
): ExternalRequestGuard {
    return Object.freeze({
        ...guard,
        protectionKinds: Object.freeze([...guard.protectionKinds]),
    });
}
