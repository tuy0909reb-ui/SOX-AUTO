import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_BOUNDARIES,
    COMPOSITION_BOUNDARY_IDS,
    COMPOSITION_BOUNDARY_OUTCOME,
    COMPOSITION_BOUNDARY_VERIFICATION,
    CompositionBoundaryId,
    getCompositionBoundary,
} from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionBoundary.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_boundary.md"
);

const EXPECTED: Array<{ id: CompositionBoundaryId; title: string; statement: string }> =
    [
        {
            id: "CB-1",
            title: "Structural Boundary",
            statement:
                "Composition SHALL define structural responsibility boundaries only.",
        },
        {
            id: "CB-2",
            title: "Runtime Boundary",
            statement:
                "Composition SHALL remain independent of runtime execution. Runtime behavior SHALL NOT influence composition semantics.",
        },
        {
            id: "CB-3",
            title: "Expansion Boundary",
            statement:
                "Composition SHALL NOT define expansion algorithms. Expansion semantics SHALL remain outside the composition contract.",
        },
        {
            id: "CB-4",
            title: "Validation Boundary",
            statement:
                "Composition SHALL NOT define validation behavior. Validation semantics SHALL remain outside the composition contract.",
        },
        {
            id: "CB-5",
            title: "Failure Boundary",
            statement:
                "Composition SHALL NOT define failure behavior. Failure semantics SHALL remain outside the composition contract.",
        },
        {
            id: "CB-6",
            title: "WorkflowBuilder Boundary",
            statement:
                "Composition SHALL NOT define WorkflowBuilder responsibilities. WorkflowBuilder SHALL remain responsible for PipelineDefinition construction.",
        },
        {
            id: "CB-7",
            title: "ExecutionGraph Boundary",
            statement:
                "Composition SHALL NOT define ExecutionGraph construction. ExecutionGraph construction SHALL remain outside the scope of this contract.",
        },
        {
            id: "CB-8",
            title: "Scheduling Boundary",
            statement:
                "Composition SHALL remain independent of scheduling strategies. Scheduling SHALL NOT influence composition semantics.",
        },
        {
            id: "CB-9",
            title: "Engine Boundary",
            statement:
                "Composition SHALL remain independent of engine allocation. Engine allocation SHALL remain outside the scope of this contract.",
        },
        {
            id: "CB-10",
            title: "Downstream Boundary",
            statement:
                "Composition SHALL preserve clear responsibility boundaries for downstream architectural contracts.",
        },
    ];

describe("ASA-ARCH-21.3 Chapter 2 — Composition Boundary", () => {
    test("CB-1 through CB-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_BOUNDARY_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_BOUNDARIES).toHaveLength(10);
        for (const e of EXPECTED) {
            const b = getCompositionBoundary(e.id);
            expect(b.title).toBe(e.title);
            expect(b.statement).toBe(e.statement);
            expect(Object.isFrozen(b)).toBe(true);
        }
    });

    test("Boundary Verification and Boundary Outcome are preserved", () => {
        expect([...COMPOSITION_BOUNDARY_VERIFICATION]).toEqual([
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
        expect(Object.isFrozen(COMPOSITION_BOUNDARY_VERIFICATION)).toBe(true);
        expect(COMPOSITION_BOUNDARY_OUTCOME.statement).toMatch(
            /architectural boundaries for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_BOUNDARY_OUTCOME.scope).toMatch(/structural boundaries only/);
        expect(COMPOSITION_BOUNDARY_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_BOUNDARY_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no behavioral / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_BOUNDARIES)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_BOUNDARY_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_BOUNDARIES as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition boundary registry only/
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

    test("preserves frozen Chapter 1 Composition Principles (extension only)", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS[0]).toBe("CB-1");
        expect(COMPOSITION_BOUNDARY_IDS[9]).toBe("CB-10");
    });
});
