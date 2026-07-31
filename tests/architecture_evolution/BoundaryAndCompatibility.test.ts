import {
    analyzeContractDifference,
} from "../../src/architecture_evolution/ContractAnalyzer";
import { createImpactReport } from "../../src/architecture_evolution/ImpactAnalyzer";
import {
    freezeCompatibilityRules,
    validateCompatibility,
} from "../../src/architecture_evolution/CompatibilityValidator";
import { evaluateValidationRules } from "../../src/architecture_evolution/ValidationRules";
import { baseEvolutionBuilder } from "./evolutionFixtures";
import {
    sampleCurrentSnapshot,
    sampleDependencyGraph,
    sampleProposedBreakingExtensionSnapshot,
    sampleProposedCoreBreakSnapshot,
} from "./evolutionFixtures";

describe("ASA-ARCH-42.0 — Boundary Tests", () => {
    test("BT-001 Core Contract Modification Request → FAIL", () => {
        const layer = baseEvolutionBuilder().establish();
        expect(layer.authorityBoundary.forbidsModifyCore).toBe(true);

        const difference = analyzeContractDifference({
            analysisId: "bt-001",
            current: sampleCurrentSnapshot(),
            proposed: sampleProposedCoreBreakSnapshot(),
            coreContractIds: ["ASA_CORE", "core_contract"],
        });
        expect(difference.touchesCore).toBe(true);

        const impact = createImpactReport({
            changed_component: "ASA_CORE",
            difference,
            dependencyGraph: sampleDependencyGraph(),
        });
        expect(impact.compatibility_result).toBe("FAIL");
        expect(impact.severity).toBe("CRITICAL");

        const validation = evaluateValidationRules({
            attemptsCoreModification: true,
            attemptsFrozenContractModification: false,
            attemptsAutomaticDecision: false,
            attemptsExtensionBoundaryViolation: false,
            generatedRecordPresent: true,
            treatsRecordAsApprovalAuthority: false,
        });
        expect(validation.outcome).toBe("FAIL");
        expect(
            validation.results.find((r) => r.ruleId === "RULE-001")?.outcome
        ).toBe("FAIL");
    });

    test("BT-002 Automatic Freeze Approval Request → FAIL", () => {
        const layer = baseEvolutionBuilder().establish();
        expect(layer.authorityBoundary.forbidsApproveFreeze).toBe(true);
        expect(layer.authorityBoundary.forbidsAutomaticDecision).toBe(true);
        expect(layer.recorderRole.forbidsFreezeAuthorize).toBe(true);
        expect(layer.compatibilityRole.forbidsApproveFreeze).toBe(true);
        expect(
            layer.authorityBoundary.finalAuthority
        ).toBe("HUMAN_ARCHITECT");

        const validation = evaluateValidationRules({
            attemptsCoreModification: false,
            attemptsFrozenContractModification: false,
            attemptsAutomaticDecision: true,
            attemptsExtensionBoundaryViolation: false,
            generatedRecordPresent: true,
            treatsRecordAsApprovalAuthority: false,
        });
        expect(validation.outcome).toBe("FAIL");
        expect(
            validation.results.find((r) => r.ruleId === "RULE-003")?.outcome
        ).toBe("FAIL");
    });
});

describe("ASA-ARCH-42.0 — Compatibility Tests", () => {
    test("COMP-001 Breaking Extension Change → Compatibility FAIL", () => {
        const difference = analyzeContractDifference({
            analysisId: "comp-001",
            current: sampleCurrentSnapshot(),
            proposed: sampleProposedBreakingExtensionSnapshot(),
            frozenContractIds: ["ext.contract.B"],
        });
        expect(difference.removedKeys).toContain("ext.contract.B");

        const impact = createImpactReport({
            changed_component: "ext.contract.A",
            difference,
            dependencyGraph: sampleDependencyGraph(),
            extensionIds: ["ASA-SCENARIO"],
        });
        expect(impact.breaking_change).toBe(true);

        const result = validateCompatibility({
            impact,
            existing: {
                architecture_version: "ASA-ARCH-42.0",
                frozenContractIds: ["ext.contract.B"],
                coreContractIds: ["ASA_CORE"],
            },
            rules: freezeCompatibilityRules(),
            extensionBoundaryViolated: false,
        });
        expect(result.outcome).toBe("FAIL");
        expect(result.compatibilityIsNotFreezeApproval).toBe(true);
    });
});
