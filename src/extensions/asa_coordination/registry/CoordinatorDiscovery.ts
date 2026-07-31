/**
 * ASA-ARCH-40.0 - Coordinator Discovery Contract (Draft 0.4)
 *
 * Criteria declaration only — not a discovery engine.
 * Returns metadata references only.
 */

/**
 * Coordinator Discovery Contract.
 */
export interface CoordinatorDiscoveryContract {
    readonly discoveryContractId: string;
    readonly operationLabel: "discoverCoordinators";
    readonly criteriaDeclaredStructurally: true;
    readonly returnsMetadataReferencesOnly: true;
    readonly consumesExtensionRegistryByReference: true;
    readonly registryIsNotExecutionAuthority: true;
    readonly forbidsInstantiateOrAuthorizeCoordinator: true;
    readonly forbidsFrameworkMutation: true;
    readonly isNotRuntimeDiscoveryEngine: true;
}

export function freezeCoordinatorDiscoveryContract(
    contract: CoordinatorDiscoveryContract
): CoordinatorDiscoveryContract {
    return Object.freeze({ ...contract });
}
