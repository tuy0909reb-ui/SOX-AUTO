import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_CONTRACTS,
    COMPOSITION_CONTRACT_IDS,
    COMPOSITION_CONTRACT_OUTCOME,
    COMPOSITION_CONTRACT_VERIFICATION,
    CompositionContractId,
    getCompositionContract,
} from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(__dirname, "../../src/workflow/CompositionContract.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_contract.md"
);

const EXPECTED: Array<{
    id: CompositionContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "CC-1",
        title: "Composition Unit Contract",
        statement:
            "Composition unit contracts SHALL conform to the structural composition model. Composition unit contracts SHALL remain declarative.",
    },
    {
        id: "CC-2",
        title: "Parent-Child Contract",
        statement:
            "Parent-child relationship contracts SHALL conform to the structural composition model. Parent-child relationship contracts SHALL remain structural only.",
    },
    {
        id: "CC-3",
        title: "Nested Composition Contract",
        statement:
            "Nested composition contracts SHALL conform to the structural composition model. Nested composition contracts SHALL preserve structural hierarchy and structural consistency.",
    },
    {
        id: "CC-4",
        title: "Structural Layering Contract",
        statement:
            "Structural layering contracts SHALL preserve structural responsibility boundaries. Structural layering contracts SHALL remain independent of runtime semantics.",
    },
    {
        id: "CC-5",
        title: "Structural Visibility Contract",
        statement:
            "Structural visibility contracts SHALL govern structural visibility within the structural composition model. Structural visibility contracts SHALL remain structural only.",
    },
    {
        id: "CC-6",
        title: "Encapsulation Contract",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Internal composition details SHALL NOT affect external composition semantics.",
    },
    {
        id: "CC-7",
        title: "Structural Cohesion Contract",
        statement:
            "Structural cohesion contracts SHALL preserve structural cohesion. Structural cohesion SHALL remain implementation-independent.",
    },
    {
        id: "CC-8",
        title: "Structural Coupling Contract",
        statement:
            "Structural coupling contracts SHALL define explicit structural coupling. Structural coupling SHALL preserve dependency direction and structural isolation.",
    },
    {
        id: "CC-9",
        title: "Recursive Composition Contract",
        statement:
            "Recursive composition contracts SHALL conform to the structural composition model. Recursive composition contracts SHALL preserve deterministic composition semantics.",
    },
    {
        id: "CC-10",
        title: "Downstream Contract",
        statement:
            "Composition contracts SHALL preserve compatibility with downstream architectural contracts.",
    },
];

describe("ASA-ARCH-21.3 Chapter 4 — Composition Contract", () => {
    test("CC-1 through CC-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_CONTRACT_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(COMPOSITION_CONTRACTS).toHaveLength(10);
        for (const e of EXPECTED) {
            const c = getCompositionContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("Contract Verification and Contract Outcome are preserved", () => {
        expect([...COMPOSITION_CONTRACT_VERIFICATION]).toEqual([
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
        expect(Object.isFrozen(COMPOSITION_CONTRACT_VERIFICATION)).toBe(true);
        expect(COMPOSITION_CONTRACT_OUTCOME.statement).toMatch(
            /architectural foundation for subsequent Pipeline Composition/
        );
        expect(COMPOSITION_CONTRACT_OUTCOME.scope).toMatch(
            /structural composition contract only/
        );
        expect(COMPOSITION_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_CONTRACT_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no behavioral / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_CONTRACTS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_CONTRACT_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_CONTRACTS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition contract registry only/
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

    test("preserves frozen Chapter 1–3 contracts (extension only)", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS[0]).toBe("CC-1");
        expect(COMPOSITION_CONTRACT_IDS[9]).toBe("CC-10");
    });
});
