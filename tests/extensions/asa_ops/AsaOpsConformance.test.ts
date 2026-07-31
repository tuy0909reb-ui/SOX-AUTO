import { baseOpsValidator } from "./opsFixtures";

describe("ASA-ARCH-36.0 — ASA-OPS Conformance", () => {
    test("deterministic establish yields equal structural JSON", () => {
        const a = baseOpsValidator()
            .withLayerId("ops-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();
        const b = baseOpsValidator()
            .withLayerId("ops-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();

        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: {
                    ...layer.identity,
                    sourceFrameworkId: layer.identity.sourceFrameworkId,
                },
                metadata: layer.metadata,
                extensionContract: layer.extensionContract,
                observation: layer.observation,
                logging: layer.logging,
                audit: layer.audit,
                monitoring: layer.monitoring,
                health: layer.health,
                reporting: layer.reporting,
                executionTrace: layer.executionTrace,
                securityBoundary: layer.securityBoundary,
                interactionContract: layer.interactionContract,
            });

        expect(serialize(a)).toBe(serialize(b));
    });

    test("preserves Core / Governance / Framework contracts", () => {
        const layer = baseOpsValidator().establish();
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.sourceFramework.identity.coreVersion).toBe(
            "ASA-CORE-34.0"
        );
        expect(layer.sourceFramework.identity.architectureVersion).toBe(
            "ASA-ARCH-35.1"
        );
        expect(layer.extensionContract.compatibility).toEqual(
            expect.arrayContaining([
                "ASA-CORE-34.0",
                "ASA-ARCH-35.x",
                "ASA-ARCH-35.1",
            ])
        );
        expect(layer.extensionContract.forbidsCoreMutation).toBe(true);
        expect(layer.extensionContract.forbidsGovernanceMutation).toBe(true);
        expect(layer.extensionContract.forbidsDecisionMaking).toBe(true);
        expect(layer.extensionContract.forbidsExecutionTrigger).toBe(true);
    });

    test("isolation posture — OPS removal does not require Core mutation path", () => {
        const layer = baseOpsValidator().establish();
        expect(layer.extensionContract.forbidsRegistryMutation).toBe(true);
        expect(layer.metadata.preservesCoreContract).toBe(true);
        expect(
            layer.sourceFramework.extensionTemplate.regressionStandard
                .isolationTestRequired
        ).toBe(true);
    });
});
