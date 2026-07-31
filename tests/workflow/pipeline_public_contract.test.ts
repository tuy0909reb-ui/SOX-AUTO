import * as fs from "fs";
import * as path from "path";
import {
    getPipelinePublicContract,
    PIPELINE_PUBLIC_CONTRACT_IDS,
    PIPELINE_PUBLIC_CONTRACTS,
    PipelinePublicContractId,
} from "../../src/workflow/PipelinePublicContract";
import {
    PD8_FORBIDDEN_COMPOSITION,
    PD13_INVALID_STRUCTURE_CATEGORIES,
    RECOGNIZED_STRUCTURAL_ELEMENTS,
    PipelineDefinitionStructure,
    SequenceElement,
} from "../../src/workflow/StructuralElement";
import {
    PI11_INITIAL_STRUCTURAL_ELEMENTS,
    PIPELINE_INVARIANT_IDS,
} from "../../src/workflow/PipelineInvariants";

const SRC_PC = path.resolve(__dirname, "../../src/workflow/PipelinePublicContract.ts");
const SRC_SE = path.resolve(__dirname, "../../src/workflow/StructuralElement.ts");
const SRC_PD_21_1 = path.resolve(__dirname, "../../src/workflow/PipelineDefinition.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_2_pipeline_public_contract.md"
);

const EXPECTED: Array<{
    id: PipelinePublicContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "PD-1",
        title: "Definition Object",
        statement: "PipelineDefinition SHALL be a definition object.",
    },
    {
        id: "PD-2",
        title: "Recognized Structural Elements",
        statement:
            "PipelineDefinition SHALL consist only of recognized structural elements.",
    },
    {
        id: "PD-3",
        title: "Sequence Contract",
        statement:
            "Sequence SHALL define a deterministic ordered list of structural elements.",
    },
    {
        id: "PD-4",
        title: "Parallel Contract",
        statement:
            "Parallel SHALL define a deterministic set of concurrently eligible branches.",
    },
    {
        id: "PD-5",
        title: "Branch Contract",
        statement:
            "Branch SHALL define a structural conditional path identified by a Condition Identifier.",
    },
    {
        id: "PD-6",
        title: "Merge Contract",
        statement: "Merge SHALL define a structural convergence point.",
    },
    {
        id: "PD-7",
        title: "NestedPipeline Contract",
        statement:
            "NestedPipeline SHALL embed another PipelineDefinition as a structural element.",
    },
    {
        id: "PD-8",
        title: "Composition Contract",
        statement:
            "PipelineDefinition SHALL consist only of Recognized Structural Elements, StepDefinitions (21.0), NestedPipeline, and PipelineDefinition (recursive structure).",
    },
    {
        id: "PD-9",
        title: "Expansion Capability",
        statement:
            "PipelineDefinition SHALL be expandable into exactly one valid Workflow.",
    },
    {
        id: "PD-10",
        title: "Expansion Boundary",
        statement:
            "PipelineDefinition SHALL define the boundary for expansion by an expansion component.",
    },
    {
        id: "PD-11",
        title: "Read-only Exposure",
        statement: "PipelineDefinition SHALL be publicly exposed as read-only.",
    },
    {
        id: "PD-12",
        title: "WorkflowBuilder Compatibility",
        statement:
            "Expansion result SHALL satisfy WorkflowBuilder requirements.",
    },
    {
        id: "PD-13",
        title: "Structural Validity",
        statement:
            "PipelineDefinition containing an invalid structure SHALL be considered invalid.",
    },
];

describe("ASA-ARCH-21.2 Chapter 2 — PipelineDefinition Public Contract", () => {
    test("VP-201 artifacts exist", () => {
        expect(fs.existsSync(SRC_PC)).toBe(true);
        expect(fs.existsSync(SRC_SE)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
    });

    test("VP-202 every PD-1…PD-13 represented with frozen wording", () => {
        expect(PIPELINE_PUBLIC_CONTRACT_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(PIPELINE_PUBLIC_CONTRACTS).toHaveLength(13);
        for (const e of EXPECTED) {
            const c = getPipelinePublicContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
        expect(Object.isFrozen(PIPELINE_PUBLIC_CONTRACTS)).toBe(true);
    });

    test("VP-203 recognized structural elements initial set", () => {
        expect([...RECOGNIZED_STRUCTURAL_ELEMENTS]).toEqual([
            "Sequence",
            "Parallel",
            "Branch",
            "Merge",
            "NestedPipeline",
        ]);
        expect(Object.isFrozen(RECOGNIZED_STRUCTURAL_ELEMENTS)).toBe(true);
        // Aligns with Chapter 1 PI-11 initial intent (Nested → NestedPipeline naming in Ch2)
        expect([...PI11_INITIAL_STRUCTURAL_ELEMENTS]).toEqual(
            expect.arrayContaining(["Sequence", "Parallel", "Branch", "Merge", "Nested"])
        );
    });

    test("VP-204 no expansion / validation / failure / runtime algorithms", () => {
        for (const file of [SRC_PC, SRC_SE]) {
            const body = fs.readFileSync(file, "utf8");
            expect(body).not.toMatch(
                /\bfunction\s+(expand|validate|classifyFailure|evaluateCondition)\b/
            );
            expect(body).not.toMatch(
                /\bclass\s+(PipelineExpander|PipelineValidator|PipelineBuilder|PipelineParser|PipelineCompiler)\b/
            );
            expect(body).not.toMatch(/\b(assignEngine|dispatchNode)\s*\(/);
            expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
            expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        }
        expect(PD13_INVALID_STRUCTURE_CATEGORIES.length).toBeGreaterThan(0);
        expect(Object.isFrozen(PD13_INVALID_STRUCTURE_CATEGORIES)).toBe(true);
    });

    test("VP-205 read-only / deterministic Definition Object surface", () => {
        const seq: SequenceElement = Object.freeze({
            kind: "Sequence",
            elements: Object.freeze([
                Object.freeze({ kind: "StepRef", stepId: "a" }),
            ]),
        });
        const structure: PipelineDefinitionStructure = Object.freeze({ root: seq });
        expect(structure.root.kind).toBe("Sequence");
        expect(getPipelinePublicContract("PD-1").statement).toMatch(/definition object/i);
        expect(getPipelinePublicContract("PD-11").statement).toMatch(/read-only/i);
        expect(getPipelinePublicContract("PD-3").statement).toMatch(/deterministic/i);
        expect([...PD8_FORBIDDEN_COMPOSITION]).toEqual(
            expect.arrayContaining([
                "Runtime object",
                "Engine",
                "Scheduler",
                "DispatchStrategy",
                "ExecutionGraph",
                "Workflow instance",
                "Runtime data",
            ])
        );
        expect(() => {
            (PIPELINE_PUBLIC_CONTRACTS as unknown as Array<unknown>).push({});
        }).toThrow();
    });

    test("VP-206 preserves PI-* and does not alter 21.1 PipelineDefinition module", () => {
        expect(PIPELINE_INVARIANT_IDS).toHaveLength(13);
        expect(getPipelinePublicContract("PD-12").statement).toMatch(/WorkflowBuilder/);
        expect(getPipelinePublicContract("PD-9").statement).toMatch(
            /exactly one valid Workflow/
        );
        const pdBody = fs.readFileSync(SRC_PD_21_1, "utf8");
        // 21.1 helper remains; Chapter 2 does not absorb expander/validator into it
        expect(pdBody).toMatch(/class PipelineDefinition/);
        expect(pdBody).not.toMatch(/\bclass\s+PipelineExpander\b/);
        const ch2Body = fs.readFileSync(SRC_PC, "utf8");
        expect(ch2Body).toMatch(/SHALL preserve ASA-ARCH-21\.2 Chapter 1/);
    });
});
