import * as fs from "fs";
import * as path from "path";
import {
    getPipelineInvariant,
    PI11_INITIAL_STRUCTURAL_ELEMENTS,
    PI4_FORBIDDEN_RUNTIME_CONCERNS,
    PIPELINE_INVARIANT_IDS,
    PIPELINE_INVARIANTS,
    PipelineInvariantId,
} from "../../src/workflow/PipelineInvariants";

const SRC = path.resolve(__dirname, "../../src/workflow/PipelineInvariants.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_2_pipeline_invariants.md"
);

const EXPECTED: Array<{
    id: PipelineInvariantId;
    title: string;
    statement: string;
    category: "core" | "structural" | "failure";
}> = [
    {
        id: "PI-1",
        title: "Immutable Lifecycle",
        statement:
            "Pipeline SHALL become immutable immediately after successful validation.",
        category: "core",
    },
    {
        id: "PI-2",
        title: "Read-only Exposure",
        statement:
            "Pipeline SHALL be exposed as read-only to all external components.",
        category: "core",
    },
    {
        id: "PI-3",
        title: "Determinism",
        statement: "Pipeline SHALL be deterministic.",
        category: "core",
    },
    {
        id: "PI-4",
        title: "Structure Only",
        statement:
            "Pipeline SHALL represent workflow structure only. Pipeline SHALL NOT define runtime behavior or execution policy.",
        category: "core",
    },
    {
        id: "PI-5",
        title: "Single Expansion",
        statement:
            "Pipeline SHALL be expandable into exactly one valid Workflow.",
        category: "core",
    },
    {
        id: "PI-6",
        title: "Acyclic Expansion",
        statement: "Expanded Workflow SHALL be acyclic.",
        category: "core",
    },
    {
        id: "PI-7",
        title: "Compatibility with WorkflowBuilder",
        statement: "Pipeline SHALL be compatible with WorkflowBuilder (21.1).",
        category: "core",
    },
    {
        id: "PI-8",
        title: "Implementation Independence",
        statement: "Pipeline SHALL be implementation independent.",
        category: "core",
    },
    {
        id: "PI-9",
        title: "Semantic Independence",
        statement:
            "Pipeline semantics SHALL be independent from representation.",
        category: "core",
    },
    {
        id: "PI-10",
        title: "Complete Structural Definition",
        statement: "Pipeline SHALL represent a complete structural definition.",
        category: "structural",
    },
    {
        id: "PI-11",
        title: "Recognized Structural Elements",
        statement:
            "Pipeline SHALL consist only of recognized structural elements.",
        category: "structural",
    },
    {
        id: "PI-12",
        title: "No Runtime-dependent Branching",
        statement: "Pipeline SHALL NOT contain runtime-dependent branching.",
        category: "structural",
    },
    {
        id: "PI-13",
        title: "Immediate Failure on Violation",
        statement:
            "Any violation of Pipeline Invariants SHALL cause immediate failure.",
        category: "failure",
    },
];

describe("ASA-ARCH-21.2 Chapter 1 — Pipeline Invariants", () => {
    test("VP-001 artifacts exist", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
    });

    test("VP-002 every PI-1…PI-13 represented with frozen wording", () => {
        expect(PIPELINE_INVARIANT_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(PIPELINE_INVARIANTS).toHaveLength(13);
        for (const e of EXPECTED) {
            const inv = getPipelineInvariant(e.id);
            expect(inv.title).toBe(e.title);
            expect(inv.statement).toBe(e.statement);
            expect(inv.category).toBe(e.category);
            expect(Object.isFrozen(inv)).toBe(true);
        }
        expect(Object.isFrozen(PIPELINE_INVARIANTS)).toBe(true);
        expect(Object.isFrozen(PIPELINE_INVARIANT_IDS)).toBe(true);
    });

    test("VP-003 no expansion / validation / failure-classification algorithms", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).not.toMatch(/\bfunction\s+(expand|validate|classifyFailure)\b/);
        expect(body).not.toMatch(/\bclass\s+(PipelineExpander|PipelineValidator|PipelineBuilder)\b/);
        expect(body).not.toMatch(/\b(detectCycle|evaluateCondition|assignEngine)\b/);
        // PI-13 states immediate failure only — no failure taxonomy enums
        expect(body).not.toMatch(/FailureKind|FailureClass|ErrorTaxonomy/);
    });

    test("VP-004 Structure Only / no runtime-dependent branching boundary documented", () => {
        expect([...PI4_FORBIDDEN_RUNTIME_CONCERNS]).toEqual(
            expect.arrayContaining([
                "Retry",
                "Timeout",
                "Engine assignment",
                "Scheduler behavior",
                "Priority",
                "Load balancing",
                "Dispatch preference",
                "Compensation",
                "Execution Policy",
            ])
        );
        expect(Object.isFrozen(PI4_FORBIDDEN_RUNTIME_CONCERNS)).toBe(true);
        expect(getPipelineInvariant("PI-12").statement).toMatch(
            /SHALL NOT contain runtime-dependent branching/
        );
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).not.toMatch(/\bclass\s+Scheduler\b|\bclass\s+EnginePool\b/);
        expect(body).not.toMatch(/dispatchNode\s*\(|assignEngine\s*\(/);
    });

    test("VP-005 read-only exposure of invariant registry", () => {
        expect(Object.isFrozen(PIPELINE_INVARIANTS)).toBe(true);
        expect(Object.isFrozen(PI11_INITIAL_STRUCTURAL_ELEMENTS)).toBe(true);
        expect([...PI11_INITIAL_STRUCTURAL_ELEMENTS]).toEqual([
            "Sequence",
            "Parallel",
            "Branch",
            "Merge",
            "Nested",
        ]);
        expect(() => {
            (PIPELINE_INVARIANTS as unknown as Array<unknown>).push({});
        }).toThrow();
    });

    test("VP-006 responsibility boundaries preserved in statements", () => {
        expect(getPipelineInvariant("PI-7").statement).toMatch(/WorkflowBuilder \(21\.1\)/);
        expect(getPipelineInvariant("PI-5").statement).toMatch(/exactly one valid Workflow/);
        expect(getPipelineInvariant("PI-6").statement).toMatch(/acyclic/i);
        const body = fs.readFileSync(SRC, "utf8");
        // Chapter 1 module must not import orchestration / runtime packages
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
    });
});
