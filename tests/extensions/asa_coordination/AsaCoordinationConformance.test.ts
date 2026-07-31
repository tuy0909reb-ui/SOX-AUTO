import { baseCoordinationValidator } from "./coordinationFixtures";

describe("ASA-ARCH-40.0 — ASA-COORDINATION Conformance", () => {
    test("deterministic establish yields equal structural JSON", () => {
        const a = baseCoordinationValidator()
            .withLayerId("coord-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();
        const b = baseCoordinationValidator()
            .withLayerId("coord-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();

        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: layer.identity,
                metadata: layer.metadata,
                coordinatorContract: layer.coordinatorContract,
                coordinationContract: layer.coordinationContract,
                planContract: layer.planContract,
                resultContract: layer.resultContract,
                confidenceContract: layer.confidenceContract,
                providerRole: layer.providerRole,
                inputBoundary: layer.inputBoundary,
                outputBoundary: layer.outputBoundary,
                participationBoundary: layer.participationBoundary,
                humanAuthorityBoundary: layer.humanAuthorityBoundary,
                aiBoundary: layer.aiBoundary,
                securityContract: layer.securityContract,
                selfCoordinationRestriction: layer.selfCoordinationRestriction,
                memoryContract: layer.memoryContract,
                validationBoundary: layer.validationBoundary,
                coordinatorRegistration: layer.coordinatorRegistration,
                coordinatorDiscovery: layer.coordinatorDiscovery,
                coordinatorSelection: layer.coordinatorSelection,
                fallbackStrategy: layer.fallbackStrategy,
                lifecycleContract: layer.lifecycleContract,
                determinismPolicy: layer.determinismPolicy,
                securityBoundary: layer.securityBoundary,
                siblingIndependence: layer.siblingIndependence,
            });

        expect(serialize(a)).toBe(serialize(b));
    });

    test("preserves Core / Governance / Framework / OPS / CONNECT / AI / VALIDATION", () => {
        const layer = baseCoordinationValidator().establish();
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.sourceFramework.identity.architectureVersion).toBe(
            "ASA-ARCH-35.1"
        );
        expect(layer.coordinatorContract.compatibility).toEqual(
            expect.arrayContaining([
                "ASA-CORE-34.0",
                "ASA-ARCH-35.x",
                "ASA-ARCH-35.1",
                "ASA-ARCH-36.0",
                "ASA-ARCH-37.0",
                "ASA-ARCH-38.0",
                "ASA-ARCH-39.0",
            ])
        );
        expect(layer.metadata.preservesCoreContract).toBe(true);
        expect(layer.metadata.preservesGovernanceContract).toBe(true);
        expect(layer.metadata.preservesFrameworkContract).toBe(true);
        expect(layer.metadata.preservesOpsContract).toBe(true);
        expect(layer.metadata.preservesConnectContract).toBe(true);
        expect(layer.metadata.preservesAiContract).toBe(true);
        expect(layer.metadata.preservesValidationContract).toBe(true);
        expect(layer.siblingIndependence.peerToOps).toBe(true);
        expect(layer.siblingIndependence.peerToConnect).toBe(true);
        expect(layer.siblingIndependence.peerToAi).toBe(true);
        expect(layer.siblingIndependence.peerToValidation).toBe(true);
        expect(layer.siblingIndependence.forbidsCoreIntrusion).toBe(true);
    });

    test("isolation posture — Coordination removal does not require Core mutation", () => {
        const layer = baseCoordinationValidator().establish();
        expect(layer.coordinatorContract.forbidsCoreMutation).toBe(true);
        expect(layer.coordinatorContract.forbidsAuthorityEscalation).toBe(true);
        expect(layer.participationBoundary.forbidsPrivateStateAccess).toBe(true);
        expect(
            layer.sourceFramework.extensionTemplate.regressionStandard
                .isolationTestRequired
        ).toBe(true);
    });
});
