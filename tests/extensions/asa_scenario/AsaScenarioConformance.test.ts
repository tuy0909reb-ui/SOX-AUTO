import { baseScenarioValidator } from "./scenarioFixtures";

describe("ASA-ARCH-41.0 — ASA-SCENARIO Conformance", () => {
    test("deterministic establish yields equal structural JSON", () => {
        const a = baseScenarioValidator()
            .withLayerId("scen-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();
        const b = baseScenarioValidator()
            .withLayerId("scen-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();

        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: layer.identity,
                metadata: layer.metadata,
                extensionContract: layer.extensionContract,
                scenarioContract: layer.scenarioContract,
                definitionContract: layer.definitionContract,
                compositionContract: layer.compositionContract,
                lifecycleContract: layer.lifecycleContract,
                providerRole: layer.providerRole,
                inputBoundary: layer.inputBoundary,
                outputBoundary: layer.outputBoundary,
                participationBoundary: layer.participationBoundary,
                coordinationBoundary: layer.coordinationBoundary,
                validationBoundary: layer.validationBoundary,
                aiBoundary: layer.aiBoundary,
                memoryContract: layer.memoryContract,
                securityContract: layer.securityContract,
                selfScenarioRestriction: layer.selfScenarioRestriction,
                registrationContract: layer.registrationContract,
                discoveryContract: layer.discoveryContract,
                selectionContract: layer.selectionContract,
                determinismPolicy: layer.determinismPolicy,
                securityBoundary: layer.securityBoundary,
                siblingIndependence: layer.siblingIndependence,
            });

        expect(serialize(a)).toBe(serialize(b));
    });

    test("preserves Core through COORDINATION contracts", () => {
        const layer = baseScenarioValidator().establish();
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.sourceFramework.identity.architectureVersion).toBe(
            "ASA-ARCH-35.1"
        );
        expect(layer.extensionContract.compatibility).toEqual(
            expect.arrayContaining([
                "ASA-CORE-34.0",
                "ASA-ARCH-35.1",
                "ASA-ARCH-36.0",
                "ASA-ARCH-37.0",
                "ASA-ARCH-38.0",
                "ASA-ARCH-39.0",
                "ASA-ARCH-40.0",
            ])
        );
        expect(layer.metadata.preservesCoreContract).toBe(true);
        expect(layer.metadata.preservesCoordinationContract).toBe(true);
        expect(layer.siblingIndependence.peerToCoordination).toBe(true);
        expect(layer.siblingIndependence.forbidsCoreIntrusion).toBe(true);
    });

    test("isolation posture — Scenario removal does not require Core mutation", () => {
        const layer = baseScenarioValidator().establish();
        expect(layer.extensionContract.forbidsCoreMutation).toBe(true);
        expect(layer.extensionContract.forbidsAuthorityEscalation).toBe(true);
        expect(
            layer.participationBoundary.referencesSiblingsViaDeclaredContractsOnly
        ).toBe(true);
        expect(
            layer.sourceFramework.extensionTemplate.regressionStandard
                .isolationTestRequired
        ).toBe(true);
    });
});
