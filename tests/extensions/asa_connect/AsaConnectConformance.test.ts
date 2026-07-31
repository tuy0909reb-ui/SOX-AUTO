import { baseConnectValidator } from "./connectFixtures";

describe("ASA-ARCH-37.0 — ASA-CONNECT Conformance", () => {
    test("deterministic establish yields equal structural JSON", () => {
        const a = baseConnectValidator()
            .withLayerId("connect-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();
        const b = baseConnectValidator()
            .withLayerId("connect-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();

        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: layer.identity,
                metadata: layer.metadata,
                extensionContract: layer.extensionContract,
                connectors: layer.connectors,
                externalData: layer.externalData,
                transformation: layer.transformation,
                router: layer.router,
                authentication: layer.authentication,
                secretProtection: layer.secretProtection,
                errorContract: layer.errorContract,
                requestGuard: layer.requestGuard,
                outboundBoundary: layer.outboundBoundary,
                lifecycleValidator: layer.lifecycleValidator,
                securityBoundary: layer.securityBoundary,
                capabilitySeparation: layer.capabilitySeparation,
                communicationContract: layer.communicationContract,
            });

        expect(serialize(a)).toBe(serialize(b));
    });

    test("preserves Core / Governance / Framework / OPS contracts", () => {
        const layer = baseConnectValidator().establish();
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
            ])
        );
        expect(layer.metadata.preservesCoreContract).toBe(true);
        expect(layer.metadata.preservesGovernanceContract).toBe(true);
        expect(layer.metadata.preservesFrameworkContract).toBe(true);
        expect(layer.metadata.preservesOpsContract).toBe(true);
        expect(layer.extensionContract.forbidsCoreMutation).toBe(true);
        expect(layer.extensionContract.forbidsGovernanceMutation).toBe(true);
    });

    test("isolation / external failure posture does not imply Core mutation path", () => {
        const layer = baseConnectValidator().establish();
        expect(layer.communicationContract.forbidsExternalDirectCoreAccess).toBe(
            true
        );
        expect(layer.outboundBoundary.forbidsCoreDirectExternalAccess).toBe(
            true
        );
        expect(
            layer.sourceFramework.extensionTemplate.regressionStandard
                .isolationTestRequired
        ).toBe(true);
        expect(layer.errorContract.pipeline).toEqual([
            "EXTERNAL_ERROR",
            "CONNECTOR_ERROR_CONTRACT",
            "ASA_ERROR_HANDLING",
        ]);
    });
});
