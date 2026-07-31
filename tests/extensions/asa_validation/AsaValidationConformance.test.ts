import { baseValidationValidator } from "./validationFixtures";

describe("ASA-ARCH-39.0 — ASA-VALIDATION Conformance", () => {
    test("deterministic establish yields equal structural JSON", () => {
        const a = baseValidationValidator()
            .withLayerId("val-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();
        const b = baseValidationValidator()
            .withLayerId("val-conf")
            .withCreationTimestamp("2026-07-30T00:00:00Z")
            .withProducerIdentity("asa-test")
            .establish();

        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: layer.identity,
                metadata: layer.metadata,
                extensionContract: layer.extensionContract,
                validationContract: layer.validationContract,
                providerRole: layer.providerRole,
                resultContract: layer.resultContract,
                confidenceContract: layer.confidenceContract,
                findingContract: layer.findingContract,
                riskAssessmentBoundary: layer.riskAssessmentBoundary,
                evidenceContract: layer.evidenceContract,
                inputBoundary: layer.inputBoundary,
                outputBoundary: layer.outputBoundary,
                memoryBoundary: layer.memoryBoundary,
                observationBoundary: layer.observationBoundary,
                certificationBoundary: layer.certificationBoundary,
                selfValidationRestriction: layer.selfValidationRestriction,
                aiOutputValidationBoundary: layer.aiOutputValidationBoundary,
                complianceContract: layer.complianceContract,
                changeImpactAnalysis: layer.changeImpactAnalysis,
                regressionAssurance: layer.regressionAssurance,
                securityContract: layer.securityContract,
                auditCompatibility: layer.auditCompatibility,
                determinismPolicy: layer.determinismPolicy,
                validatorRegistration: layer.validatorRegistration,
                validatorDiscovery: layer.validatorDiscovery,
                validatorSelection: layer.validatorSelection,
                fallbackStrategy: layer.fallbackStrategy,
                lifecycleContract: layer.lifecycleContract,
                securityBoundary: layer.securityBoundary,
                siblingIndependence: layer.siblingIndependence,
            });

        expect(serialize(a)).toBe(serialize(b));
    });

    test("preserves Core / Governance / Framework / OPS / CONNECT / AI contracts", () => {
        const layer = baseValidationValidator().establish();
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
                "ASA-ARCH-38.0",
            ])
        );
        expect(layer.metadata.preservesCoreContract).toBe(true);
        expect(layer.metadata.preservesGovernanceContract).toBe(true);
        expect(layer.metadata.preservesFrameworkContract).toBe(true);
        expect(layer.metadata.preservesOpsContract).toBe(true);
        expect(layer.metadata.preservesConnectContract).toBe(true);
        expect(layer.metadata.preservesAiContract).toBe(true);
        expect(layer.siblingIndependence.peerToOps).toBe(true);
        expect(layer.siblingIndependence.peerToConnect).toBe(true);
        expect(layer.siblingIndependence.peerToAi).toBe(true);
        expect(layer.siblingIndependence.forbidsCoreIntrusion).toBe(true);
    });

    test("isolation posture — Validation removal does not require Core mutation path", () => {
        const layer = baseValidationValidator().establish();
        expect(layer.extensionContract.forbidsCoreMutation).toBe(true);
        expect(layer.extensionContract.forbidsAuthorityEscalation).toBe(true);
        expect(layer.observationBoundary.forbidsDirectRuntimeState).toBe(true);
        expect(
            layer.sourceFramework.extensionTemplate.regressionStandard
                .isolationTestRequired
        ).toBe(true);
    });
});
