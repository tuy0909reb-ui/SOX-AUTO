import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_EVOLUTIONS,
    COMPOSITION_EVOLUTION_IDS,
    COMPOSITION_EVOLUTION_OUTCOME,
    COMPOSITION_EVOLUTION_VERIFICATION,
    CompositionEvolutionId,
    getCompositionEvolution,
} from "../../src/workflow/CompositionEvolution";
import { COMPOSITION_LIFECYCLE_IDS } from "../../src/workflow/CompositionLifecycle";
import { COMPOSITION_VALIDATION_IDS } from "../../src/workflow/CompositionValidation";
import { COMPOSITION_CONSTRAINT_IDS } from "../../src/workflow/CompositionConstraints";
import { COMPOSITION_INVARIANT_IDS } from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionEvolution.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_evolution.md"
);

const EXPECTED: Array<{
    id: CompositionEvolutionId;
    title: string;
    statement: string;
}> = [
    {
        id: "CE-1",
        title: "Evolution Scope",
        statement:
            "Composition evolution SHALL define structural evolution of composition entities within the composition model. Evolution scope SHALL remain declarative.",
    },
    {
        id: "CE-2",
        title: "Evolution Identity",
        statement:
            "Every evolved composition structure SHALL preserve structural identity. Evolution identity SHALL remain structurally identifiable.",
    },
    {
        id: "CE-3",
        title: "Structural Preservation",
        statement:
            "Composition evolution SHALL preserve existing structural composition integrity. Structural preservation SHALL remain independent of runtime semantics.",
    },
    {
        id: "CE-4",
        title: "Evolution Determinism",
        statement:
            "Equivalent structural evolution definitions SHALL preserve identical structural evolution semantics. Evolution semantics SHALL remain deterministic.",
    },
    {
        id: "CE-5",
        title: "Evolution Boundary",
        statement:
            "Composition evolution SHALL preserve boundaries between existing and evolved structural composition states. Evolution boundaries SHALL remain structurally isolated.",
    },
    {
        id: "CE-6",
        title: "Compatibility Preservation",
        statement:
            "Composition evolution SHALL preserve compatibility with existing composition contracts. Evolution SHALL NOT invalidate frozen structural contracts.",
    },
    {
        id: "CE-7",
        title: "Incremental Evolution",
        statement:
            "Composition evolution SHALL permit incremental structural changes. Incremental evolution SHALL remain declarative.",
    },
    {
        id: "CE-8",
        title: "Structural Consistency",
        statement:
            "Composition evolution SHALL preserve structural consistency across evolved composition structures. Structural consistency SHALL remain invariant.",
    },
    {
        id: "CE-9",
        title: "Downstream Preservation",
        statement:
            "Composition evolution SHALL preserve compatibility with downstream architectural contracts. Downstream contracts SHALL NOT alter evolution semantics.",
    },
    {
        id: "CE-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition evolution. Composition evolution SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 9 — Composition Evolution", () => {
    test("CE-1 through CE-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_EVOLUTION_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_EVOLUTIONS).toHaveLength(10);
        for (const e of EXPECTED) {
            const ev = getCompositionEvolution(e.id);
            expect(ev.title).toBe(e.title);
            expect(ev.statement).toBe(e.statement);
            expect(Object.isFrozen(ev)).toBe(true);
        }
    });

    test("Evolution Verification and Evolution Outcome are preserved", () => {
        expect([...COMPOSITION_EVOLUTION_VERIFICATION]).toEqual([
            "Runtime execution",
            "Evolution execution algorithms",
            "Migration algorithms",
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
        expect(Object.isFrozen(COMPOSITION_EVOLUTION_VERIFICATION)).toBe(true);
        expect(COMPOSITION_EVOLUTION_OUTCOME.statement).toMatch(
            /architectural evolution foundation for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_EVOLUTION_OUTCOME.scope).toMatch(
            /structural composition evolution only/
        );
        expect(COMPOSITION_EVOLUTION_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_EVOLUTION_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no evolution / migration / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_EVOLUTIONS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_EVOLUTION_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_EVOLUTIONS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition evolution registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|evolve|migrate|applyEvolution)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|EvolutionEngine|MigrationEngine|EvolutionExecutor)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 1–8 contracts (extension only)", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS).toHaveLength(10);
        expect(COMPOSITION_CONSTRAINT_IDS).toHaveLength(10);
        expect(COMPOSITION_VALIDATION_IDS).toHaveLength(10);
        expect(COMPOSITION_LIFECYCLE_IDS).toHaveLength(10);
        expect(COMPOSITION_EVOLUTION_IDS[0]).toBe("CE-1");
        expect(COMPOSITION_EVOLUTION_IDS[9]).toBe("CE-10");
        expect(getCompositionEvolution("CE-6").statement).toMatch(
            /SHALL NOT invalidate frozen structural contracts/
        );
    });
});
