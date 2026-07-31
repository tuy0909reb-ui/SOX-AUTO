import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_PRINCIPLE_BOUNDARY,
    COMPOSITION_PRINCIPLE_IDS,
    COMPOSITION_PRINCIPLE_OUTCOME,
    COMPOSITION_PRINCIPLES,
    CompositionPrincipleId,
    getCompositionPrinciple,
} from "../../src/workflow/CompositionPrinciples";
import { FAILURE_CONTRACT_IDS } from "../../src/workflow/FailureContracts";
import { PIPELINE_INVARIANT_IDS } from "../../src/workflow/PipelineInvariants";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionPrinciples.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_principles.md"
);

const EXPECTED: Array<{ id: CompositionPrincipleId; title: string; statement: string }> =
    [
        {
            id: "CP-1",
            title: "Declarative Composition",
            statement:
                "Pipeline composition SHALL be declaratively defined. Composition contracts SHALL define structural semantics only.",
        },
        {
            id: "CP-2",
            title: "Structural Composition",
            statement:
                "Composition SHALL be expressed solely through structural relationships.",
        },
        {
            id: "CP-3",
            title: "Deterministic Composition",
            statement:
                "Equivalent PipelineDefinition structures SHALL produce identical composition semantics. Composition SHALL be deterministic.",
        },
        {
            id: "CP-4",
            title: "Read-only Composition",
            statement:
                "Composition SHALL NOT modify PipelineDefinition. Composition SHALL describe structural relationships only.",
        },
        {
            id: "CP-5",
            title: "Structural Responsibility",
            statement:
                "Every composition unit SHALL have clearly defined structural responsibility. Composition SHALL preserve structural responsibility isolation.",
        },
        {
            id: "CP-6",
            title: "Structural Consistency",
            statement:
                "Composition SHALL preserve structural consistency across composed PipelineDefinition structures.",
        },
        {
            id: "CP-7",
            title: "Encapsulation",
            statement:
                "Composition SHALL preserve encapsulation boundaries. Internal structural details SHALL NOT affect external composition semantics.",
        },
        {
            id: "CP-8",
            title: "Hierarchical Composition",
            statement:
                "Composition SHALL support hierarchical structural organization. The composition hierarchy SHALL remain declarative and deterministic.",
        },
        {
            id: "CP-9",
            title: "NestedPipeline Composition",
            statement:
                "NestedPipeline SHALL follow the same composition principles as any other composition unit.",
        },
        {
            id: "CP-10",
            title: "Downstream Compatibility",
            statement:
                "Composition SHALL preserve compatibility with downstream structural contracts. Composition SHALL define structural semantics only.",
        },
    ];

describe("ASA-ARCH-21.3 Chapter 1 — Composition Principles", () => {
    test("CP-1 through CP-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_PRINCIPLE_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_PRINCIPLES).toHaveLength(10);
        for (const e of EXPECTED) {
            const p = getCompositionPrinciple(e.id);
            expect(p.title).toBe(e.title);
            expect(p.statement).toBe(e.statement);
            expect(Object.isFrozen(p)).toBe(true);
        }
    });

    test("Principle Boundary and Principle Outcome are preserved", () => {
        expect([...COMPOSITION_PRINCIPLE_BOUNDARY]).toEqual([
            "Runtime execution",
            "Expansion algorithms",
            "Validation algorithms",
            "Failure handling",
            "ExecutionGraph construction",
            "Scheduling",
            "Optimization",
            "Performance",
            "Engine allocation",
            "Dispatch behavior",
        ]);
        expect(Object.isFrozen(COMPOSITION_PRINCIPLE_BOUNDARY)).toBe(true);
        expect(COMPOSITION_PRINCIPLE_OUTCOME.statement).toMatch(
            /architectural foundation for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_PRINCIPLE_OUTCOME.scope).toMatch(/structural principles only/);
        expect(COMPOSITION_PRINCIPLE_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_PRINCIPLE_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no behavioral / runtime / mutable state", () => {
        expect(Object.isFrozen(COMPOSITION_PRINCIPLES)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_PRINCIPLE_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_PRINCIPLES as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition principle registry only/
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
        expect(body).not.toMatch(/let\s+|var\s+/);
    });

    test("preserves frozen 21.2 registries (extension only)", () => {
        expect(PIPELINE_INVARIANT_IDS).toHaveLength(13);
        expect(FAILURE_CONTRACT_IDS).toHaveLength(17);
        expect(COMPOSITION_PRINCIPLE_IDS[0]).toBe("CP-1");
        expect(COMPOSITION_PRINCIPLE_IDS[9]).toBe("CP-10");
    });
});
