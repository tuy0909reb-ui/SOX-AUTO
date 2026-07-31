/**
 * ASA-ARCH-38.0 - Intelligence Provider Contract (Draft 0.5)
 *
 * Technology-independent intelligence capability surface.
 * Declares operations only — not an inference engine.
 */

/** Declared intelligence operations. */
export type IntelligenceOperation =
    | "interpret"
    | "analyze"
    | "evaluate"
    | "explain"
    | "summarize"
    | "propose"
    | "confidence"
    | "uncertainty";

/**
 * Intelligence Contract — standardized intelligence surface.
 */
export interface IntelligenceContract {
    readonly contractId: string;
    readonly operations: ReadonlyArray<IntelligenceOperation>;
    readonly technologyIndependent: true;
    readonly forbidsVendorCoupling: true;
}

export function freezeIntelligenceContract(
    contract: IntelligenceContract
): IntelligenceContract {
    return Object.freeze({
        ...contract,
        operations: Object.freeze([...contract.operations]),
    });
}
