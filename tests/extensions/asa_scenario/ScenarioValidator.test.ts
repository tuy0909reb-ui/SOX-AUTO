import {
    baseScenarioValidator,
    sampleExtensionContract,
} from "./scenarioFixtures";

describe("ASA-ARCH-41.0 — ScenarioValidator", () => {
    test("establishes immutable layer with SCENARIO_DESIGNER authority", () => {
        const layer = baseScenarioValidator().establish();
        expect(Object.isFrozen(layer)).toBe(true);
        expect(layer.identity.extensionId).toBe("ASA-SCENARIO");
        expect(layer.extensionContract.authority).toBe("SCENARIO_DESIGNER");
        expect(
            layer.securityBoundary.holdsScenarioDesignerResponsibility
        ).toBe(true);
        expect(layer.securityBoundary.holdsExecutionAuthority).toBe(false);
    });

    test("rejects non-SCENARIO_DESIGNER authority", () => {
        const bad = {
            ...sampleExtensionContract(),
            authority: "ADVISOR" as unknown as "SCENARIO_DESIGNER",
        };
        expect(() =>
            baseScenarioValidator().withExtensionContract(bad).establish()
        ).toThrow(/Authority Declaration must be SCENARIO_DESIGNER/);
    });

    test("rejects capability activation posture", () => {
        expect(() =>
            baseScenarioValidator()
                .withDefinitionContract({
                    definitionContractId: "bad",
                    requiredFields: [
                        "id",
                        "name",
                        "objective",
                        "scenarioScope",
                        "scenarioParticipants",
                        "capabilityReferences",
                        "interactionIntent",
                        "constraints",
                        "intendedOutcomeDescription",
                        "version",
                        "timestamp",
                    ],
                    capabilityReferencesIdentifyDeclaredOnly: true,
                    capabilityReferenceDoesNotReserve: true,
                    capabilityReferenceDoesNotActivate: false as true,
                    capabilityReferenceDoesNotCreateDependency: true,
                    interactionIntentDescribesRelationshipsOnly: true,
                    interactionIntentDoesNotDefineExecutionSequence: true,
                    intendedOutcomeIsDescriptiveOnly: true,
                    intendedOutcomeIsNotExecutionResult: true,
                })
                .establish()
        ).toThrow(/Capability Reference/);
    });

    test("rejects dynamic composition as execution", () => {
        expect(() =>
            baseScenarioValidator()
                .withCompositionContract({
                    compositionContractId: "bad",
                    requiredFields: [
                        "scenarioId",
                        "components",
                        "relationships",
                        "constraints",
                        "compositionType",
                        "timestamp",
                    ],
                    allowedCompositionTypes: ["static", "dynamic", "conditional"],
                    compositionDefinesStructureOnly: true,
                    compositionDoesNotDefineExecutionOrder: true,
                    compositionDoesNotOwnExtensions: true,
                    compositionDoesNotModifyExtensionOwnership: true,
                    dynamicCompositionIsNotDynamicExecution: false as true,
                    compositionModeIsNotExecutionMode: true,
                })
                .establish()
        ).toThrow(/Dynamic Composition boundary/);
    });

    test("rejects execution-capable provider", () => {
        expect(() =>
            baseScenarioValidator()
                .withProviderRole({
                    roleId: "bad",
                    operations: [
                        "createScenarioDefinition",
                        "describeScenario",
                        "composeReference",
                        "addConstraint",
                        "requestReview",
                    ],
                    createsScenarioDefinitions: true,
                    resolvesDeclaredReferences: true,
                    describesExtensionComposition: true,
                    maintainsScenarioStructure: true,
                    providesScenarioInformation: true,
                    isNotExecutionProvider: true,
                    forbidsExecute: false as true,
                    forbidsInvokeRuntime: true,
                    forbidsAuthorize: true,
                    forbidsMutateExtension: true,
                })
                .establish()
        ).toThrow(/Provider must forbid execution/);
    });
});
