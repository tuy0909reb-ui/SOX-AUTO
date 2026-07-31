/**
 * ASA-ARCH-40.0 - Coordination Confidence Contract (Draft 0.4)
 *
 * Reliability of coordination structure only —
 * not execution permission, authority, or decision confidence.
 */

/**
 * Coordination Confidence Contract.
 */
export interface CoordinationConfidenceContract {
    readonly confidenceContractId: string;
    readonly valueRange: "0.0_TO_1.0";
    readonly requiredFields: ReadonlyArray<"value" | "reason" | "calculationMethod">;
    readonly confidenceIsNotExecutionPermission: true;
    readonly confidenceIsNotAuthority: true;
    readonly confidenceIsNotDecisionConfidence: true;
}

export function freezeCoordinationConfidenceContract(
    contract: CoordinationConfidenceContract
): CoordinationConfidenceContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}
