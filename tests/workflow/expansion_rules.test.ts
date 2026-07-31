import * as fs from "fs";
import * as path from "path";
import {
    ER13_COMPOSITION_RULES,
    ER15_INVALID_EXPANSION_CATEGORIES,
    ER4_FORBIDDEN_EXPANSION_CONCERNS,
    EXPANSION_RULE_IDS,
    EXPANSION_RULES,
    ExpansionRuleId,
    getExpansionRule,
} from "../../src/workflow/ExpansionRules";
import { PIPELINE_INVARIANT_IDS } from "../../src/workflow/PipelineInvariants";
import { PIPELINE_PUBLIC_CONTRACT_IDS } from "../../src/workflow/PipelinePublicContract";

const SRC = path.resolve(__dirname, "../../src/workflow/ExpansionRules.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_2_expansion_rules.md"
);
const PI_SRC = path.resolve(__dirname, "../../src/workflow/PipelineInvariants.ts");
const PD_SRC = path.resolve(__dirname, "../../src/workflow/PipelinePublicContract.ts");

const EXPECTED: Array<{ id: ExpansionRuleId; title: string; statement: string }> = [
    {
        id: "ER-1",
        title: "Deterministic Expansion",
        statement: "PipelineDefinition SHALL expand deterministically.",
    },
    {
        id: "ER-2",
        title: "Single Expansion",
        statement:
            "PipelineDefinition SHALL expand into exactly one valid WorkflowDefinition.",
    },
    {
        id: "ER-3",
        title: "Acyclic Expansion",
        statement: "Expanded WorkflowDefinition SHALL be acyclic.",
    },
    {
        id: "ER-4",
        title: "Structure Only",
        statement: "Expansion SHALL preserve structural semantics only.",
    },
    {
        id: "ER-5",
        title: "Expansion Operation",
        statement:
            "Expansion SHALL operate on PipelineDefinition and produce one WorkflowDefinition.",
    },
    {
        id: "ER-6",
        title: "WorkflowBuilder Boundary",
        statement:
            "Expansion result SHALL satisfy WorkflowBuilder requirements.",
    },
    {
        id: "ER-7",
        title: "Sequence Expansion",
        statement: "Sequence SHALL expand into a linear Workflow segment.",
    },
    {
        id: "ER-8",
        title: "Parallel Expansion",
        statement:
            "Parallel SHALL expand into multiple independent Workflow segments.",
    },
    {
        id: "ER-9",
        title: "Branch Expansion",
        statement:
            "Branch SHALL expand into conditional Workflow segments identified by a Structural Condition Reference.",
    },
    {
        id: "ER-10",
        title: "Merge Expansion",
        statement: "Merge SHALL expand into a structural convergence point.",
    },
    {
        id: "ER-11",
        title: "NestedPipeline Expansion",
        statement: "NestedPipeline SHALL expand into a Workflow subgraph.",
    },
    {
        id: "ER-12",
        title: "StepDefinition Expansion",
        statement:
            "StepDefinition SHALL be preserved as exactly one Workflow step during expansion.",
    },
    {
        id: "ER-13",
        title: "Structural Composition",
        statement:
            "Each recognized structural element SHALL define its own composition rule.",
    },
    {
        id: "ER-14",
        title: "Valid Expansion",
        statement:
            "Valid WorkflowDefinition SHALL satisfy Deterministic, Acyclic, and Structural completeness.",
    },
    {
        id: "ER-15",
        title: "Invalid Expansion",
        statement:
            "Expansion result not satisfying ER-1 through ER-14 SHALL be considered invalid.",
    },
];

describe("ASA-ARCH-21.2 Chapter 3 — Expansion Rules", () => {
    test("VP-301 artifacts exist", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
    });

    test("VP-302 every ER-1…ER-15 represented with frozen wording", () => {
        expect(EXPANSION_RULE_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(EXPANSION_RULES).toHaveLength(15);
        for (const e of EXPECTED) {
            const r = getExpansionRule(e.id);
            expect(r.title).toBe(e.title);
            expect(r.statement).toBe(e.statement);
            expect(Object.isFrozen(r)).toBe(true);
        }
        expect(Object.isFrozen(EXPANSION_RULES)).toBe(true);
    });

    test("VP-303 principles / structural / composition / validity coverage", () => {
        expect(getExpansionRule("ER-1").category).toBe("principle");
        expect(getExpansionRule("ER-5").category).toBe("boundary");
        expect(getExpansionRule("ER-7").category).toBe("structural");
        expect(getExpansionRule("ER-12").category).toBe("composition");
        expect(getExpansionRule("ER-14").category).toBe("validity");
        expect(ER13_COMPOSITION_RULES).toEqual({
            Sequence: "Linear composition",
            Parallel: "Independent composition",
            Branch: "Conditional composition",
            Merge: "Convergence composition",
            NestedPipeline: "Recursive composition",
        });
        expect(Object.isFrozen(ER13_COMPOSITION_RULES)).toBe(true);
        expect([...ER4_FORBIDDEN_EXPANSION_CONCERNS]).toEqual(
            expect.arrayContaining([
                "Runtime semantics",
                "Retry",
                "Timeout",
                "Engine assignment",
                "Scheduler behavior",
                "Execution policy",
            ])
        );
        expect([...ER15_INVALID_EXPANSION_CATEGORIES]).toEqual(
            expect.arrayContaining([
                "Cycle generation",
                "Ambiguous expansion",
                "Incomplete structure",
                "Infinite recursion",
                "Structural rule violation",
            ])
        );
    });

    test("VP-304 no expansion engine / algorithm / cycle detection / graph construction", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(/Declarative architectural expansion rule registry only/);
        expect(body).not.toMatch(
            /\bfunction\s+(expand|validate|detectCycle|buildGraph|constructNode)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(ExpansionEngine|ExpansionComponent|PipelineExpander|PipelineCompiler|WorkflowCompiler)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/\b(assignEngine|dispatchNode)\s*\(/);
    });

    test("VP-305 read-only / deterministic registry", () => {
        expect(Object.isFrozen(EXPANSION_RULE_IDS)).toBe(true);
        expect(Object.isFrozen(ER15_INVALID_EXPANSION_CATEGORIES)).toBe(true);
        expect(getExpansionRule("ER-1").statement).toMatch(/deterministically/i);
        expect(() => {
            (EXPANSION_RULES as unknown as Array<unknown>).push({});
        }).toThrow();
    });

    test("VP-306 preserves PI-* / PD-* and WorkflowBuilder boundary is declarative", () => {
        expect(PIPELINE_INVARIANT_IDS).toHaveLength(13);
        expect(PIPELINE_PUBLIC_CONTRACT_IDS).toHaveLength(13);
        expect(getExpansionRule("ER-6").statement).toMatch(/WorkflowBuilder/);
        expect(getExpansionRule("ER-12").statement).toMatch(/exactly one Workflow step/);
        expect(fs.existsSync(PI_SRC)).toBe(true);
        expect(fs.existsSync(PD_SRC)).toBe(true);
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(/Chapter 1 Pipeline Invariants/);
        expect(body).toMatch(/Chapter 2 PipelineDefinition Public Contract/);
    });
});
