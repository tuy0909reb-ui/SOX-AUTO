import { baseScenarioValidator } from "./scenarioFixtures";

describe("ASA-ARCH-41.0 — AsaScenarioLayer", () => {
    test("ScenarioDefinition and ScenarioComposition contracts are established", () => {
        const layer = baseScenarioValidator().establish();
        expect(layer.definitionContract.requiredFields).toEqual(
            expect.arrayContaining([
                "id",
                "name",
                "objective",
                "capabilityReferences",
                "intendedOutcomeDescription",
            ])
        );
        expect(
            layer.definitionContract.capabilityReferenceDoesNotActivate
        ).toBe(true);
        expect(layer.compositionContract.allowedCompositionTypes).toEqual([
            "static",
            "dynamic",
            "conditional",
        ]);
        expect(
            layer.compositionContract.dynamicCompositionIsNotDynamicExecution
        ).toBe(true);
    });

    test("enforces authority / execution / validation / registry boundaries", () => {
        const layer = baseScenarioValidator().establish();
        expect(layer.extensionContract.forbidsExecute).toBe(true);
        expect(layer.providerRole.forbidsInvokeRuntime).toBe(true);
        expect(layer.outputBoundary.definitionIsNotExecutionPlan).toBe(true);
        expect(layer.validationBoundary.integratesWithValidationReadOnly).toBe(
            true
        );
        expect(
            layer.registrationContract.registrationDoesNotGrantExecutionAuthority
        ).toBe(true);
        expect(layer.discoveryContract.returnsScenarioMetadataOnly).toBe(true);
        expect(layer.selectionContract.producesRecommendationOnly).toBe(true);
        expect(layer.selfScenarioRestriction.forbidsApproveOwnAuthority).toBe(
            true
        );
        expect(layer.determinismPolicy.requiredMetadata).toEqual(
            expect.arrayContaining([
                "scenarioVersion",
                "definitionHash",
                "referenceHash",
                "timestamp",
            ])
        );
    });

    test("lifecycle and coordination / AI isolation", () => {
        const layer = baseScenarioValidator().establish();
        expect(layer.lifecycleContract.allowedStates).toEqual([
            "Created",
            "Defined",
            "Reviewed",
            "Released",
            "Deprecated",
            "Archived",
            "Rejected",
        ]);
        expect(layer.lifecycleContract.releasedDoesNotMeanExecutable).toBe(true);
        expect(
            layer.coordinationBoundary.scenarioDoesNotRequireCoordination
        ).toBe(true);
        expect(layer.aiBoundary.aiCapabilityReferenceIsNotAiAuthority).toBe(
            true
        );
        expect(layer.memoryContract.memoryIsNotCoreState).toBe(true);
    });
});
