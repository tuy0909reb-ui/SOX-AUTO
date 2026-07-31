import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_INTEGRATIONS,
    COMPOSITION_INTEGRATION_IDS,
    COMPOSITION_INTEGRATION_OUTCOME,
    COMPOSITION_INTEGRATION_VERIFICATION,
    CompositionIntegrationId,
    getCompositionIntegration,
} from "../../src/workflow/CompositionIntegration";
import { COMPOSITION_EVOLUTION_IDS } from "../../src/workflow/CompositionEvolution";
import { COMPOSITION_LIFECYCLE_IDS } from "../../src/workflow/CompositionLifecycle";
import { COMPOSITION_VALIDATION_IDS } from "../../src/workflow/CompositionValidation";
import { COMPOSITION_CONSTRAINT_IDS } from "../../src/workflow/CompositionConstraints";
import { COMPOSITION_INVARIANT_IDS } from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionIntegration.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_integration.md"
);

const EXPECTED: Array<{
    id: CompositionIntegrationId;
    title: string;
    statement: string;
}> = [
    {
        id: "CIG-1",
        title: "Integration Scope",
        statement:
            "Composition integration SHALL define structural integration of composition entities within the Pipeline composition model. Integration scope SHALL remain declarative.",
    },
    {
        id: "CIG-2",
        title: "Composition Reference Integrity",
        statement:
            "Composition integration SHALL preserve references between integrated composition entities. Reference integrity SHALL remain structural only.",
    },
    {
        id: "CIG-3",
        title: "Structural Assembly Integrity",
        statement:
            "Composition integration SHALL preserve structural consistency during structural composition assembly. Structural assembly SHALL remain independent of runtime semantics.",
    },
    {
        id: "CIG-4",
        title: "Contract Preservation",
        statement:
            "Composition integration SHALL preserve existing and frozen composition contracts. Integration SHALL NOT invalidate frozen architectural contracts.",
    },
    {
        id: "CIG-5",
        title: "Integration Determinism",
        statement:
            "Equivalent structural composition integrations SHALL preserve identical integration semantics. Integration semantics SHALL remain deterministic.",
    },
    {
        id: "CIG-6",
        title: "Boundary Preservation",
        statement:
            "Composition integration SHALL preserve boundaries between integrated composition structures. Integration boundaries SHALL remain structurally isolated.",
    },
    {
        id: "CIG-7",
        title: "Compatibility Preservation",
        statement:
            "Composition integration SHALL preserve compatibility with existing and frozen composition contracts. Compatibility SHALL remain independent of behavioral semantics.",
    },
    {
        id: "CIG-8",
        title: "Structural Consistency",
        statement:
            "Composition integration SHALL preserve structural consistency across integrated composition structures. Structural consistency SHALL remain invariant.",
    },
    {
        id: "CIG-9",
        title: "Downstream Compatibility",
        statement:
            "Composition integration SHALL preserve compatibility with downstream architectural contracts. Downstream contracts SHALL NOT alter integration semantics.",
    },
    {
        id: "CIG-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition integration. Composition integration SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 10 — Composition Integration", () => {
    test("CIG-1 through CIG-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_INTEGRATION_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_INTEGRATIONS).toHaveLength(10);
        for (const e of EXPECTED) {
            const i = getCompositionIntegration(e.id);
            expect(i.title).toBe(e.title);
            expect(i.statement).toBe(e.statement);
            expect(Object.isFrozen(i)).toBe(true);
        }
    });

    test("Integration Verification and Integration Outcome are preserved", () => {
        expect([...COMPOSITION_INTEGRATION_VERIFICATION]).toEqual([
            "Runtime execution",
            "Runtime composition mutation",
            "Dynamic composition modification",
            "Integration execution algorithms",
            "Expansion algorithms",
            "Validation algorithms",
            "Failure handling",
            "ExecutionGraph construction",
            "Scheduling",
            "Optimization",
            "Performance characteristics",
            "Engine allocation",
            "Dispatch behavior",
        ]);
        expect(Object.isFrozen(COMPOSITION_INTEGRATION_VERIFICATION)).toBe(true);
        expect(COMPOSITION_INTEGRATION_OUTCOME.statement).toMatch(
            /architectural structural integration foundation for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_INTEGRATION_OUTCOME.scope).toMatch(
            /structural composition integration only/
        );
        expect(COMPOSITION_INTEGRATION_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_INTEGRATION_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no integration execution / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_INTEGRATIONS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_INTEGRATION_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_INTEGRATIONS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition integration registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|integrate|mutate|assemble)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|IntegrationEngine|AssemblyEngine|CompositionIntegrator)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 3–9 contracts (extension only)", () => {
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS).toHaveLength(10);
        expect(COMPOSITION_CONSTRAINT_IDS).toHaveLength(10);
        expect(COMPOSITION_VALIDATION_IDS).toHaveLength(10);
        expect(COMPOSITION_LIFECYCLE_IDS).toHaveLength(10);
        expect(COMPOSITION_EVOLUTION_IDS).toHaveLength(10);
        expect(COMPOSITION_INTEGRATION_IDS[0]).toBe("CIG-1");
        expect(COMPOSITION_INTEGRATION_IDS[9]).toBe("CIG-10");
        expect(getCompositionIntegration("CIG-4").statement).toMatch(
            /SHALL NOT invalidate frozen architectural contracts/
        );
    });
});
