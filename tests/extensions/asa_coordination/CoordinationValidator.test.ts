import {
    baseCoordinationValidator,
    sampleCoordinatorContract,
} from "./coordinationFixtures";

describe("ASA-ARCH-40.0 — CoordinationValidator", () => {
    test("establishes immutable layer with COORDINATOR authority", () => {
        const layer = baseCoordinationValidator().establish();
        expect(Object.isFrozen(layer)).toBe(true);
        expect(layer.identity.extensionId).toBe("ASA-COORDINATION");
        expect(layer.coordinatorContract.authority).toBe("COORDINATOR");
        expect(layer.securityBoundary.holdsCoordinatorResponsibility).toBe(true);
        expect(layer.securityBoundary.holdsExecutionAuthority).toBe(false);
    });

    test("rejects non-COORDINATOR authority", () => {
        const bad = {
            ...sampleCoordinatorContract(),
            authority: "ADVISOR" as unknown as "COORDINATOR",
        };
        expect(() =>
            baseCoordinationValidator().withCoordinatorContract(bad).establish()
        ).toThrow(/Authority Declaration must be COORDINATOR/);
    });

    test("rejects missing coordination contract", () => {
        expect(() =>
            baseCoordinationValidator()
                .withCoordinationContract(undefined as never)
                .establish()
        ).toThrow(/CoordinationContract is required/);
    });

    test("rejects execution-plan posture on plan contract", () => {
        expect(() =>
            baseCoordinationValidator()
                .withPlanContract({
                    planContractId: "bad",
                    requiredFields: [
                        "id",
                        "coordinationIntent",
                        "participants",
                        "interactionSequence",
                        "constraints",
                        "dependencies",
                        "expectedInteractionResult",
                        "timestamp",
                    ],
                    interactionSequenceIsCoordinationRelationshipOnly: true,
                    interactionSequenceIsNotExecutionOrder: false as true,
                    planIsNotExecutionPlan: true,
                })
                .establish()
        ).toThrow(/Execution Sequence Isolation/);
    });

    test("rejects discovery authorization posture", () => {
        expect(() =>
            baseCoordinationValidator()
                .withCoordinatorDiscovery({
                    discoveryContractId: "bad",
                    operationLabel: "discoverCoordinators",
                    criteriaDeclaredStructurally: true,
                    returnsMetadataReferencesOnly: true,
                    consumesExtensionRegistryByReference: true,
                    registryIsNotExecutionAuthority: true,
                    forbidsInstantiateOrAuthorizeCoordinator: false as true,
                    forbidsFrameworkMutation: true,
                    isNotRuntimeDiscoveryEngine: true,
                })
                .establish()
        ).toThrow(/Discovery Contract invalid/);
    });
});
