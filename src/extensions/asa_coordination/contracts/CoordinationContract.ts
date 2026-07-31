/**
 * ASA-ARCH-40.0 - Coordination Contract (Draft 0.4)
 *
 * Technology-independent coordination operations surface.
 * Structural declarations only — not a coordination / execution engine.
 */

/** Declared Coordination Contract operations. */
export type CoordinationOperation =
    | "coordinate"
    | "resolveContractReference"
    | "orderInteraction"
    | "compose"
    | "aggregate"
    | "report";

/**
 * Coordination Contract — method surface only.
 * No execute / mutate / authorize.
 */
export interface CoordinationContract {
    readonly contractId: string;
    readonly operations: ReadonlyArray<CoordinationOperation>;
    readonly technologyIndependent: true;
    readonly forbidsVendorCoupling: true;
    readonly forbidsExecute: true;
    readonly forbidsMutate: true;
    readonly forbidsAuthorize: true;
    readonly forbidsAutonomousExecution: true;
}

export function freezeCoordinationContract(
    contract: CoordinationContract
): CoordinationContract {
    return Object.freeze({
        ...contract,
        operations: Object.freeze([...contract.operations]),
    });
}
