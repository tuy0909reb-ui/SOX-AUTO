/**
 * ASA-ARCH-40.0 - Coordinator Registration Contract (Draft 0.4)
 *
 * Declarative registration surface. Authority is metadata only.
 */

/**
 * Coordinator Registration Contract.
 */
export interface CoordinatorRegistrationContract {
    readonly registrationContractId: string;
    readonly operationLabel: "registerCoordinator";
    readonly requiredFields: ReadonlyArray<
        | "metadata"
        | "authority"
        | "capabilities"
        | "version"
        | "coordinationScope"
        | "supportedContracts"
        | "interactionPolicy"
        | "securityProfile"
        | "determinismProfile"
    >;
    readonly authorityMustBeCoordinator: true;
    readonly authorityIsDescriptiveMetadataOnly: true;
    readonly registrationDoesNotGrantOperationalAuthority: true;
}

export function freezeCoordinatorRegistrationContract(
    contract: CoordinatorRegistrationContract
): CoordinatorRegistrationContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}
