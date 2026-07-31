import { baseValidationValidator } from "./validationFixtures";

describe("ASA-ARCH-39.0 — AsaValidationLayer", () => {
    test("exposes validation operations and result model", () => {
        const layer = baseValidationValidator().establish();
        expect(layer.validationContract.operations).toEqual(
            expect.arrayContaining([
                "validate",
                "verify",
                "compare",
                "assess",
                "report",
                "generateCertificationResult",
            ])
        );
        expect(layer.resultContract.allowedStatuses).toEqual(
            expect.arrayContaining(["PASS", "WARN", "FAIL", "UNKNOWN"])
        );
        expect(layer.confidenceContract.confidenceIsNotApproval).toBe(true);
        expect(layer.findingContract.allowedSeverities).toContain("CRITICAL");
        expect(layer.providerRole.isNotExecutionProvider).toBe(true);
    });

    test("enforces assurance boundaries", () => {
        const layer = baseValidationValidator().establish();
        expect(layer.certificationBoundary.certificationIsAssessmentResultOnly).toBe(
            true
        );
        expect(
            layer.selfValidationRestriction.forbidsCertifyOwnImplementationIntegrity
        ).toBe(true);
        expect(
            layer.aiOutputValidationBoundary.aiOutputValidationIsNotAiAuthority
        ).toBe(true);
        expect(layer.memoryBoundary.historyIsNotCoreState).toBe(true);
        expect(
            layer.observationBoundary.registryIsNotExecutionAuthority
        ).toBe(true);
        expect(layer.riskAssessmentBoundary.riskLevelDoesNotAuthorizeAction).toBe(
            true
        );
    });

    test("lifecycle and registration surfaces are structural", () => {
        const layer = baseValidationValidator().establish();
        expect(layer.lifecycleContract.allowedStates).toEqual([
            "Created",
            "Initialized",
            "Active",
            "Failed",
            "Suspended",
            "Reinitialized",
            "Terminated",
        ]);
        expect(layer.validatorRegistration.authorityMustBeValidator).toBe(true);
        expect(layer.validatorDiscovery.isNotRuntimeDiscoveryEngine).toBe(true);
        expect(layer.validatorSelection.isNotRuntimeSelectionEngine).toBe(true);
        expect(layer.fallbackStrategy.manualModePreservesHumanAuthority).toBe(
            true
        );
        expect(layer.determinismPolicy.requiredMetadata).toEqual(
            expect.arrayContaining([
                "validatorVersion",
                "ruleVersion",
                "environmentVersion",
                "configurationVersion",
                "evidenceVersion",
                "timestamp",
            ])
        );
    });

    test("audit compatibility is read-only with OPS / CONNECT / AI", () => {
        const layer = baseValidationValidator().establish();
        expect(layer.auditCompatibility.compatibleWithOpsReadOnly).toBe(true);
        expect(layer.auditCompatibility.compatibleWithConnectReadOnly).toBe(
            true
        );
        expect(layer.auditCompatibility.compatibleWithAiReadOnly).toBe(true);
        expect(layer.auditCompatibility.integrationIsReadOnly).toBe(true);
        expect(layer.securityContract.forbidsForgeEvidence).toBe(true);
    });
});
