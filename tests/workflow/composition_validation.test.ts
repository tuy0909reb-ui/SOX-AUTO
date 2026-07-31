import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_VALIDATIONS,
    COMPOSITION_VALIDATION_IDS,
    COMPOSITION_VALIDATION_OUTCOME,
    COMPOSITION_VALIDATION_VERIFICATION,
    CompositionValidationId,
    getCompositionValidation,
} from "../../src/workflow/CompositionValidation";
import { COMPOSITION_CONSTRAINT_IDS } from "../../src/workflow/CompositionConstraints";
import { COMPOSITION_INVARIANT_IDS } from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionValidation.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_validation.md"
);

const EXPECTED: Array<{
    id: CompositionValidationId;
    title: string;
    statement: string;
}> = [
    {
        id: "CV-1",
        title: "Validation Scope",
        statement:
            "Composition validation SHALL apply only to structural composition defined by the structural composition model. Validation scope SHALL remain declarative.",
    },
    {
        id: "CV-2",
        title: "Validation Target",
        statement:
            "Every composition unit defined by the structural composition model SHALL be a validation target. Validation targets SHALL remain structural only.",
    },
    {
        id: "CV-3",
        title: "Structural Validation",
        statement:
            "Composition validation SHALL verify conformance to the structural composition model. Structural validation SHALL remain independent of runtime semantics.",
    },
    {
        id: "CV-4",
        title: "Hierarchy Validation",
        statement:
            "Composition validation SHALL verify structural hierarchy consistency. Hierarchy validation SHALL remain structural only.",
    },
    {
        id: "CV-5",
        title: "Dependency Validation",
        statement:
            "Composition validation SHALL verify explicitly defined structural dependencies. Dependency validation SHALL remain declarative.",
    },
    {
        id: "CV-6",
        title: "Responsibility Validation",
        statement:
            "Composition validation SHALL verify structural responsibility boundaries. Responsibility validation SHALL remain implementation-independent.",
    },
    {
        id: "CV-7",
        title: "Encapsulation Validation",
        statement:
            "Composition validation SHALL verify encapsulation boundaries. Internal composition details SHALL NOT affect external validation semantics.",
    },
    {
        id: "CV-8",
        title: "Deterministic Validation",
        statement:
            "Equivalent structural composition SHALL preserve identical structural validation semantics. Structural validation semantics SHALL remain deterministic.",
    },
    {
        id: "CV-9",
        title: "Downstream Validation",
        statement:
            "Composition validation SHALL preserve compatibility with downstream architectural contracts. Compatibility SHALL NOT alter structural validation semantics.",
    },
    {
        id: "CV-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition validation. Composition validation SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 7 — Composition Validation", () => {
    test("CV-1 through CV-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_VALIDATION_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_VALIDATIONS).toHaveLength(10);
        for (const e of EXPECTED) {
            const v = getCompositionValidation(e.id);
            expect(v.title).toBe(e.title);
            expect(v.statement).toBe(e.statement);
            expect(Object.isFrozen(v)).toBe(true);
        }
    });

    test("Validation Verification and Validation Outcome are preserved", () => {
        expect([...COMPOSITION_VALIDATION_VERIFICATION]).toEqual([
            "Runtime execution",
            "Validation algorithms",
            "Expansion algorithms",
            "Failure handling",
            "ExecutionGraph construction",
            "Scheduling",
            "Optimization",
            "Performance characteristics",
            "Engine allocation",
            "Dispatch behavior",
        ]);
        expect(Object.isFrozen(COMPOSITION_VALIDATION_VERIFICATION)).toBe(true);
        expect(COMPOSITION_VALIDATION_OUTCOME.statement).toMatch(
            /architectural structural validation model for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_VALIDATION_OUTCOME.scope).toMatch(
            /structural composition validation only/
        );
        expect(COMPOSITION_VALIDATION_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_VALIDATION_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no behavioral validation / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_VALIDATIONS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_VALIDATION_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_VALIDATIONS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition validation contract registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine|ValidationEngine|CompositionValidator)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 1–6 contracts (extension only)", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS).toHaveLength(10);
        expect(COMPOSITION_CONSTRAINT_IDS).toHaveLength(10);
        expect(COMPOSITION_VALIDATION_IDS[0]).toBe("CV-1");
        expect(COMPOSITION_VALIDATION_IDS[9]).toBe("CV-10");
    });
});
