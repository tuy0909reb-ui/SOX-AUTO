import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_MODELS,
    COMPOSITION_MODEL_IDS,
    COMPOSITION_MODEL_OUTCOME,
    COMPOSITION_MODEL_VERIFICATION,
    CompositionModelId,
    getCompositionModel,
} from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionModel.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_model.md"
);

const EXPECTED: Array<{ id: CompositionModelId; title: string; statement: string }> =
    [
        {
            id: "CM-1",
            title: "Composition Unit",
            statement:
                "A composition unit SHALL represent a declarative structural composition element of Pipeline composition. Composition units SHALL be uniquely structurally identifiable.",
        },
        {
            id: "CM-2",
            title: "Structural Hierarchy",
            statement:
                "Composition SHALL support hierarchical structural organization. The composition hierarchy SHALL remain declarative and deterministic.",
        },
        {
            id: "CM-3",
            title: "Parent-Child Relationship",
            statement:
                "Composition SHALL define parent-child structural relationships between composition units. Parent-child relationships SHALL remain structural only.",
        },
        {
            id: "CM-4",
            title: "Nested Composition",
            statement:
                "Composition SHALL support nested composition units. Nested Pipeline composition SHALL preserve structural hierarchy and structural consistency.",
        },
        {
            id: "CM-5",
            title: "Structural Layering",
            statement:
                "Composition SHALL support structural layering. Structural layering SHALL preserve structural responsibility boundaries.",
        },
        {
            id: "CM-6",
            title: "Structural Visibility",
            statement:
                "Composition SHALL define structural visibility relationships between composition units. Structural visibility SHALL remain independent of runtime semantics.",
        },
        {
            id: "CM-7",
            title: "Encapsulation",
            statement:
                "Composition SHALL preserve encapsulation boundaries. Internal composition details SHALL NOT affect external composition semantics.",
        },
        {
            id: "CM-8",
            title: "Structural Cohesion",
            statement:
                "Composition units SHALL exhibit structural cohesion. Structural cohesion SHALL remain independent of implementation.",
        },
        {
            id: "CM-9",
            title: "Structural Coupling",
            statement:
                "Composition SHALL permit only explicitly defined structural coupling. Structural coupling SHALL preserve dependency direction and structural isolation.",
        },
        {
            id: "CM-10",
            title: "Recursive Composition",
            statement:
                "Composition SHALL support recursive structural composition. Recursive composition SHALL preserve deterministic structural composition semantics.",
        },
    ];

describe("ASA-ARCH-21.3 Chapter 3 — Composition Model", () => {
    test("CM-1 through CM-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_MODEL_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_MODELS).toHaveLength(10);
        for (const e of EXPECTED) {
            const m = getCompositionModel(e.id);
            expect(m.title).toBe(e.title);
            expect(m.statement).toBe(e.statement);
            expect(Object.isFrozen(m)).toBe(true);
        }
    });

    test("Model Verification and Model Outcome are preserved", () => {
        expect([...COMPOSITION_MODEL_VERIFICATION]).toEqual([
            "Runtime execution",
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
        expect(Object.isFrozen(COMPOSITION_MODEL_VERIFICATION)).toBe(true);
        expect(COMPOSITION_MODEL_OUTCOME.statement).toMatch(
            /architectural composition model for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_MODEL_OUTCOME.scope).toMatch(
            /structural composition model only/
        );
        expect(COMPOSITION_MODEL_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_MODEL_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no behavioral / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_MODELS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_MODEL_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_MODELS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition model registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine|ValidationEngine)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 1–2 contracts (extension only)", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS[0]).toBe("CM-1");
        expect(COMPOSITION_MODEL_IDS[9]).toBe("CM-10");
    });
});
