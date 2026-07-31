import { baseAiValidator } from "./aiFixtures";

describe("ASA-ARCH-38.0 — ASA-AI Conformance", () => {
    test("deterministic establish yields equal structural JSON", () => {
        const a = baseAiValidator()
            .withLayerId("ai-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();
        const b = baseAiValidator()
            .withLayerId("ai-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();

        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: layer.identity,
                metadata: layer.metadata,
                extensionContract: layer.extensionContract,
                intelligenceContract: layer.intelligenceContract,
                runtimeBoundary: layer.runtimeBoundary,
                sessionContract: layer.sessionContract,
                proposalContract: layer.proposalContract,
                evidenceContract: layer.evidenceContract,
                assumptionContract: layer.assumptionContract,
                confidenceContract: layer.confidenceContract,
                uncertaintyContract: layer.uncertaintyContract,
                memoryContract: layer.memoryContract,
                learningBoundary: layer.learningBoundary,
                inputOutputBoundary: layer.inputOutputBoundary,
                securityContract: layer.securityContract,
                auditContract: layer.auditContract,
                traceabilityContract: layer.traceabilityContract,
                determinismPolicy: layer.determinismPolicy,
                providerRegistration: layer.providerRegistration,
                providerDiscovery: layer.providerDiscovery,
                providerSelection: layer.providerSelection,
                fallbackStrategy: layer.fallbackStrategy,
                lifecycleContract: layer.lifecycleContract,
                securityBoundary: layer.securityBoundary,
                siblingIndependence: layer.siblingIndependence,
            });

        expect(serialize(a)).toBe(serialize(b));
    });

    test("preserves Core / Governance / Framework / OPS / CONNECT contracts", () => {
        const layer = baseAiValidator().establish();
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.sourceFramework.identity.architectureVersion).toBe(
            "ASA-ARCH-35.1"
        );
        expect(layer.extensionContract.compatibility).toEqual(
            expect.arrayContaining([
                "ASA-CORE-34.0",
                "ASA-ARCH-35.x",
                "ASA-ARCH-35.1",
                "ASA-ARCH-36.0",
                "ASA-ARCH-37.0",
            ])
        );
        expect(layer.metadata.preservesCoreContract).toBe(true);
        expect(layer.metadata.preservesGovernanceContract).toBe(true);
        expect(layer.metadata.preservesFrameworkContract).toBe(true);
        expect(layer.metadata.preservesOpsContract).toBe(true);
        expect(layer.metadata.preservesConnectContract).toBe(true);
        expect(layer.siblingIndependence.peerToOps).toBe(true);
        expect(layer.siblingIndependence.peerToConnect).toBe(true);
        expect(layer.siblingIndependence.forbidsCoreIntrusion).toBe(true);
    });

    test("isolation posture — AI removal does not require Core mutation path", () => {
        const layer = baseAiValidator().establish();
        expect(layer.extensionContract.forbidsCoreMutation).toBe(true);
        expect(layer.extensionContract.forbidsAuthorityEscalation).toBe(true);
        expect(layer.runtimeBoundary.forbidsCoreStateCoupling).toBe(true);
        expect(
            layer.sourceFramework.extensionTemplate.regressionStandard
                .isolationTestRequired
        ).toBe(true);
    });
});
