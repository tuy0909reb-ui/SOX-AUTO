import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_INVARIANTS,
    COMPOSITION_INVARIANT_IDS,
    COMPOSITION_INVARIANT_OUTCOME,
    COMPOSITION_INVARIANT_VERIFICATION,
    CompositionInvariantId,
    getCompositionInvariant,
} from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionInvariants.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_invariants.md"
);

const EXPECTED: Array<{
    id: CompositionInvariantId;
    title: string;
    statement: string;
}> = [
    {
        id: "CI-1",
        title: "Structural Identity",
        statement:
            "Every composition unit SHALL preserve its structural identity. Structural identity SHALL remain invariant within the structural composition model.",
    },
    {
        id: "CI-2",
        title: "Structural Determinism",
        statement:
            "Equivalent Pipeline composition structures SHALL preserve identical structural composition semantics. Structural determinism SHALL remain invariant.",
    },
    {
        id: "CI-3",
        title: "Hierarchical Integrity",
        statement:
            "Composition SHALL preserve hierarchical integrity. The structural hierarchy SHALL remain structurally consistent.",
    },
    {
        id: "CI-4",
        title: "Encapsulation Integrity",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Internal composition details SHALL NOT affect external composition semantics.",
    },
    {
        id: "CI-5",
        title: "Responsibility Integrity",
        statement:
            "Composition SHALL preserve structural responsibility boundaries. Structural responsibilities SHALL remain clearly isolated.",
    },
    {
        id: "CI-6",
        title: "Structural Consistency",
        statement:
            "Composition SHALL preserve structural consistency across all composition units. Structural consistency SHALL remain invariant.",
    },
    {
        id: "CI-7",
        title: "Dependency Integrity",
        statement:
            "Composition SHALL preserve structural dependency direction. Structural dependencies SHALL remain explicitly defined.",
    },
    {
        id: "CI-8",
        title: "Recursive Integrity",
        statement:
            "Recursive composition SHALL preserve deterministic structural composition semantics.",
    },
    {
        id: "CI-9",
        title: "Downstream Integrity",
        statement:
            "Composition SHALL preserve compatibility with downstream architectural contracts. Compatibility SHALL NOT alter composition invariants.",
    },
    {
        id: "CI-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition invariants. Composition invariants SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 5 — Composition Invariants", () => {
    test("CI-1 through CI-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_INVARIANT_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_INVARIANTS).toHaveLength(10);
        for (const e of EXPECTED) {
            const inv = getCompositionInvariant(e.id);
            expect(inv.title).toBe(e.title);
            expect(inv.statement).toBe(e.statement);
            expect(Object.isFrozen(inv)).toBe(true);
        }
    });

    test("Invariant Verification and Invariant Outcome are preserved", () => {
        expect([...COMPOSITION_INVARIANT_VERIFICATION]).toEqual([
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
        expect(Object.isFrozen(COMPOSITION_INVARIANT_VERIFICATION)).toBe(true);
        expect(COMPOSITION_INVARIANT_OUTCOME.statement).toMatch(
            /architectural structural invariants for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_INVARIANT_OUTCOME.scope).toMatch(
            /structural invariants only/
        );
        expect(COMPOSITION_INVARIANT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_INVARIANT_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no behavioral / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_INVARIANTS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_INVARIANT_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_INVARIANTS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition invariant registry only/
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

    test("preserves frozen Chapter 1–4 contracts (extension only)", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS[0]).toBe("CI-1");
        expect(COMPOSITION_INVARIANT_IDS[9]).toBe("CI-10");
    });
});
