import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_CONSTRAINTS,
    COMPOSITION_CONSTRAINT_IDS,
    COMPOSITION_CONSTRAINT_OUTCOME,
    COMPOSITION_CONSTRAINT_PURPOSE,
    COMPOSITION_CONSTRAINT_VERIFICATION,
    CompositionConstraintId,
    getCompositionConstraint,
} from "../../src/workflow/CompositionConstraints";
import { COMPOSITION_INVARIANT_IDS } from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionConstraints.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_constraints.md"
);

const EXPECTED: Array<{
    id: CompositionConstraintId;
    title: string;
    statement: string;
}> = [
    {
        id: "CT-1",
        title: "Structural Constraint",
        statement:
            "Composition SHALL satisfy all structural constraints defined by the structural composition model. Structural constraints SHALL remain invariant within the structural composition model.",
    },
    {
        id: "CT-2",
        title: "Identity Constraint",
        statement:
            "Composition SHALL preserve the structural identity of every composition unit. Structural identity SHALL remain invariant.",
    },
    {
        id: "CT-3",
        title: "Hierarchy Constraint",
        statement:
            "Composition SHALL preserve structural hierarchy. The structural hierarchy SHALL remain structurally consistent.",
    },
    {
        id: "CT-4",
        title: "Encapsulation Constraint",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Encapsulation constraints SHALL remain independent of runtime semantics.",
    },
    {
        id: "CT-5",
        title: "Dependency Constraint",
        statement:
            "Composition SHALL preserve explicit structural dependency direction. Structural dependencies SHALL remain explicitly defined.",
    },
    {
        id: "CT-6",
        title: "Responsibility Constraint",
        statement:
            "Composition SHALL preserve structural responsibility boundaries. Structural responsibilities SHALL remain clearly isolated.",
    },
    {
        id: "CT-7",
        title: "Coupling Constraint",
        statement:
            "Composition SHALL permit only explicitly defined structural coupling. Structural coupling SHALL preserve dependency direction and structural isolation.",
    },
    {
        id: "CT-8",
        title: "Recursive Constraint",
        statement:
            "Recursive composition SHALL preserve deterministic structural composition semantics.",
    },
    {
        id: "CT-9",
        title: "Downstream Constraint",
        statement:
            "Composition constraints SHALL preserve compatibility with downstream architectural contracts. Compatibility SHALL NOT alter composition constraints.",
    },
    {
        id: "CT-10",
        title: "Behavioral Exclusion Constraint",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition constraints. Composition constraints SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 6 — Composition Constraints", () => {
    test("CT-1 through CT-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_CONSTRAINT_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_CONSTRAINTS).toHaveLength(10);
        for (const e of EXPECTED) {
            const c = getCompositionConstraint(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("Purpose, Constraint Verification, and Constraint Outcome are preserved", () => {
        expect(COMPOSITION_CONSTRAINT_PURPOSE.statement).toMatch(
            /declarative architectural constraints governing Pipeline composition/
        );
        expect(COMPOSITION_CONSTRAINT_PURPOSE.scope).toMatch(
            /structural composition constraints only/
        );
        expect(Object.isFrozen(COMPOSITION_CONSTRAINT_PURPOSE)).toBe(true);

        expect([...COMPOSITION_CONSTRAINT_VERIFICATION]).toEqual([
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
        expect(Object.isFrozen(COMPOSITION_CONSTRAINT_VERIFICATION)).toBe(true);

        expect(COMPOSITION_CONSTRAINT_OUTCOME.statement).toMatch(
            /architectural structural constraints for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_CONSTRAINT_OUTCOME.scope).toMatch(
            /structural composition constraints only/
        );
        expect(COMPOSITION_CONSTRAINT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_CONSTRAINT_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no behavioral / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_CONSTRAINTS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_CONSTRAINT_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_CONSTRAINTS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition constraint registry only/
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

    test("preserves frozen Chapter 1–5 contracts (extension only)", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS).toHaveLength(10);
        expect(COMPOSITION_CONSTRAINT_IDS[0]).toBe("CT-1");
        expect(COMPOSITION_CONSTRAINT_IDS[9]).toBe("CT-10");
    });
});
