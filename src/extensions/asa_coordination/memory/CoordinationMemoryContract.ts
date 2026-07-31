/**
 * ASA-ARCH-40.0 - Coordination Memory Contract (Draft 0.4)
 *
 * Coordination Memory ≠ Runtime / Core / Governance / Execution State.
 */

/** Coordination memory layer kinds. */
export type CoordinationMemoryLayerKind =
    | "WORKING_COORDINATION_CONTEXT"
    | "SESSION_COORDINATION_CONTEXT"
    | "HISTORICAL_COORDINATION_RECORD";

/**
 * Coordination Memory Contract.
 */
export interface CoordinationMemoryContract {
    readonly memoryContractId: string;
    readonly layers: ReadonlyArray<CoordinationMemoryLayerKind>;
    readonly memoryIsNotRuntimeState: true;
    readonly memoryIsNotCoreState: true;
    readonly memoryIsNotGovernanceState: true;
    readonly memoryIsNotExecutionState: true;
    readonly ownershipExplicitlyDeclared: true;
    readonly memoryNeverBecomesCoreState: true;
    readonly memoryNeverGrantsAuthority: true;
    readonly historicalRecordRequiresRetentionPolicy: true;
    readonly retentionPolicyGoverned: true;
    readonly retentionDoesNotCreateAuthority: true;
    readonly retentionPolicyReferenceOnly: true;
}

export function freezeCoordinationMemoryContract(
    contract: CoordinationMemoryContract
): CoordinationMemoryContract {
    return Object.freeze({
        ...contract,
        layers: Object.freeze([...contract.layers]),
    });
}
