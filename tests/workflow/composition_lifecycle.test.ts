import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_LIFECYCLES,
    COMPOSITION_LIFECYCLE_IDS,
    COMPOSITION_LIFECYCLE_OUTCOME,
    COMPOSITION_LIFECYCLE_VERIFICATION,
    CompositionLifecycleId,
    getCompositionLifecycle,
} from "../../src/workflow/CompositionLifecycle";
import { COMPOSITION_VALIDATION_IDS } from "../../src/workflow/CompositionValidation";
import { COMPOSITION_CONSTRAINT_IDS } from "../../src/workflow/CompositionConstraints";
import { COMPOSITION_INVARIANT_IDS } from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionLifecycle.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_lifecycle.md"
);

const EXPECTED: Array<{
    id: CompositionLifecycleId;
    title: string;
    statement: string;
}> = [
    {
        id: "CL-1",
        title: "Lifecycle Scope",
        statement:
            "Composition lifecycle SHALL define structural lifecycle states of composition entities. Lifecycle scope SHALL remain declarative.",
    },
    {
        id: "CL-2",
        title: "Lifecycle Identity",
        statement:
            "Every composition entity SHALL preserve its lifecycle identity within the structural composition lifecycle model. Lifecycle identity SHALL remain structurally identifiable.",
    },
    {
        id: "CL-3",
        title: "Lifecycle State Model",
        statement:
            "Composition lifecycle SHALL support defined structural lifecycle states. Lifecycle states SHALL represent structural status only.",
    },
    {
        id: "CL-4",
        title: "State Transition Definition",
        statement:
            "Composition lifecycle SHALL define permitted structural state transitions. State transition rules SHALL remain declarative. State transitions SHALL remain independent of runtime behavior.",
    },
    {
        id: "CL-5",
        title: "Lifecycle Determinism",
        statement:
            "Equivalent structural composition states SHALL preserve identical lifecycle semantics. Lifecycle semantics SHALL remain deterministic.",
    },
    {
        id: "CL-6",
        title: "Lifecycle Consistency",
        statement:
            "Composition lifecycle SHALL preserve consistency across lifecycle states. Lifecycle consistency SHALL remain invariant.",
    },
    {
        id: "CL-7",
        title: "Lifecycle Boundary",
        statement:
            "Composition lifecycle SHALL preserve boundaries between lifecycle states. Lifecycle boundaries SHALL remain structurally isolated.",
    },
    {
        id: "CL-8",
        title: "Lifecycle Independence",
        statement:
            "Composition lifecycle SHALL remain independent of execution behavior. Lifecycle state SHALL NOT represent runtime execution state.",
    },
    {
        id: "CL-9",
        title: "Downstream Compatibility",
        statement:
            "Composition lifecycle SHALL preserve compatibility with downstream architectural contracts. Downstream contracts SHALL NOT alter lifecycle semantics.",
    },
    {
        id: "CL-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition lifecycle. Composition lifecycle SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 8 — Composition Lifecycle", () => {
    test("CL-1 through CL-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_LIFECYCLE_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_LIFECYCLES).toHaveLength(10);
        for (const e of EXPECTED) {
            const l = getCompositionLifecycle(e.id);
            expect(l.title).toBe(e.title);
            expect(l.statement).toBe(e.statement);
            expect(Object.isFrozen(l)).toBe(true);
        }
    });

    test("Lifecycle Verification and Lifecycle Outcome are preserved", () => {
        expect([...COMPOSITION_LIFECYCLE_VERIFICATION]).toEqual([
            "Runtime execution",
            "Execution state management",
            "State transition algorithms",
            "Lifecycle automation",
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
        expect(Object.isFrozen(COMPOSITION_LIFECYCLE_VERIFICATION)).toBe(true);
        expect(COMPOSITION_LIFECYCLE_OUTCOME.statement).toMatch(
            /architectural lifecycle foundation for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_LIFECYCLE_OUTCOME.scope).toMatch(
            /structural lifecycle semantics only/
        );
        expect(COMPOSITION_LIFECYCLE_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_LIFECYCLE_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no transition / automation / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_LIFECYCLES)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_LIFECYCLE_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_LIFECYCLES as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition lifecycle registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|transition|advanceLifecycle|automate)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|LifecycleEngine|StateMachine|LifecycleAutomator|TransitionExecutor)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 3–7 contracts; runtime state separation", () => {
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS).toHaveLength(10);
        expect(COMPOSITION_CONSTRAINT_IDS).toHaveLength(10);
        expect(COMPOSITION_VALIDATION_IDS).toHaveLength(10);
        expect(COMPOSITION_LIFECYCLE_IDS[0]).toBe("CL-1");
        expect(COMPOSITION_LIFECYCLE_IDS[9]).toBe("CL-10");
        expect(getCompositionLifecycle("CL-8").statement).toMatch(
            /SHALL NOT represent runtime execution state/
        );
        expect(getCompositionLifecycle("CL-3").statement).toMatch(
            /structural status only/
        );
    });
});
