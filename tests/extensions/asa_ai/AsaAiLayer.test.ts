import { AsaAiLayer } from "../../../src/extensions/asa_ai/AsaAiLayer";
import { baseAiValidator } from "./aiFixtures";

describe("ASA-ARCH-38.0 — AsaAiLayer", () => {
    test("layer holds Advisor contracts without execution authority", () => {
        const layer = baseAiValidator().establish();
        expect(layer).toBeInstanceOf(AsaAiLayer);
        expect(layer.securityBoundary.holdsExecutionAuthority).toBe(false);
        expect(layer.securityBoundary.holdsDecisionAuthority).toBe(false);
        expect(layer.securityBoundary.holdsAdvisorResponsibility).toBe(true);
        expect(layer.runtimeBoundary.forbidsAsaExecutionAuthority).toBe(true);
        expect(layer.proposalContract.proposalIsNotExecution).toBe(true);
        expect(layer.memoryContract.neverPartOfCoreState).toBe(true);
        expect(layer.memoryContract.ownershipValidatedByGovernance).toBe(true);
        expect(layer.learningBoundary.forbidsFrozenExtensionsMutation).toBe(
            true
        );
        expect(layer.securityContract.forbidsGenerateAuthority).toBe(true);
        expect(layer.providerDiscovery.isNotRuntimeDiscoveryEngine).toBe(true);
        expect(layer.providerSelection.isNotRuntimeSelectionEngine).toBe(true);
    });

    test("intelligence / audit / trace / determinism contracts present", () => {
        const layer = baseAiValidator().establish();
        expect(layer.intelligenceContract.operations).toEqual(
            expect.arrayContaining([
                "interpret",
                "analyze",
                "evaluate",
                "explain",
                "summarize",
                "propose",
                "confidence",
                "uncertainty",
            ])
        );
        expect(layer.auditContract.requiredFields).toContain("reasoningSummary");
        expect(layer.traceabilityContract.requiredStages).toEqual([
            "input",
            "interpretation",
            "analysis",
            "evaluation",
            "proposal",
            "reasoningPath",
        ]);
        expect(layer.determinismPolicy.requiredMetadata).toContain("seed");
        expect(layer.lifecycleContract.allowedStates).toContain("Active");
        expect(layer.fallbackStrategy.manualModePreservesHumanAuthority).toBe(
            true
        );
    });
});
