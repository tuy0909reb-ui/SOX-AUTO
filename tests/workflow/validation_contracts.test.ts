import * as fs from "fs";
import * as path from "path";
import {
    getValidationContract,
    VALIDATION_CONTRACT_IDS,
    VALIDATION_CONTRACTS,
    VALIDATION_OUTCOME_CLASSIFICATIONS,
    VL2_FORBIDDEN_VALIDATION_CONCERNS,
    VL4_VALIDATION_PHASES,
    ValidationContractId,
} from "../../src/workflow/ValidationContracts";
import { PIPELINE_INVARIANT_IDS } from "../../src/workflow/PipelineInvariants";
import { PIPELINE_PUBLIC_CONTRACT_IDS } from "../../src/workflow/PipelinePublicContract";
import { EXPANSION_RULE_IDS } from "../../src/workflow/ExpansionRules";

const SRC = path.resolve(__dirname, "../../src/workflow/ValidationContracts.ts");
const SPEC = path.resolve(__dirname, "../../docs/specs/asa_arch_21_2_validation.md");

const EXPECTED: Array<{ id: ValidationContractId; title: string; statement: string }> = [
    {
        id: "VL-1",
        title: "Declarative Validation",
        statement: "Validation SHALL be declarative.",
    },
    {
        id: "VL-2",
        title: "Structure Only",
        statement: "Validation SHALL operate on structural semantics only.",
    },
    {
        id: "VL-3",
        title: "Deterministic Validation",
        statement: "Validation SHALL be deterministic.",
    },
    {
        id: "VL-4",
        title: "Pipeline Validation / Workflow Validation",
        statement:
            "Validation SHALL apply to Pipeline Validation (pre-expansion) and Workflow Validation (post-expansion).",
    },
    {
        id: "VL-5",
        title: "No Execution",
        statement: "Validation SHALL NOT execute any part of the workflow.",
    },
    {
        id: "VL-6",
        title: "Validation Is Not Expansion",
        statement:
            "Validation SHALL NOT perform explicit or implicit expansion.",
    },
    {
        id: "VL-7",
        title: "Validation Is Not WorkflowBuilder",
        statement: "Validation SHALL NOT construct ExecutionGraph.",
    },
    {
        id: "VL-8",
        title: "Validation Is Not Runtime",
        statement:
            "Validation SHALL NOT reference or evaluate any runtime behavior or execution policy.",
    },
    {
        id: "VL-9",
        title: "Recognized Elements Compliance",
        statement:
            "Validation SHALL verify compliance with the structural contracts defined in Chapter 2.",
    },
    {
        id: "VL-10",
        title: "Structural Completeness Compliance",
        statement:
            "Validation SHALL verify that PipelineDefinition satisfies structural completeness as defined in Chapter 2.",
    },
    {
        id: "VL-11",
        title: "Branch / Parallel / NestedPipeline Consistency",
        statement:
            "Validation SHALL verify structural consistency of Branch, Parallel, and NestedPipeline according to Chapter 2 and Chapter 3.",
    },
    {
        id: "VL-12",
        title: "Deterministic Workflow",
        statement: "Expanded WorkflowDefinition SHALL be deterministic.",
    },
    {
        id: "VL-13",
        title: "Acyclic Workflow",
        statement: "Expanded WorkflowDefinition SHALL be acyclic.",
    },
    {
        id: "VL-14",
        title: "Structural Completeness After Expansion",
        statement:
            "Expanded WorkflowDefinition SHALL be structurally complete.",
    },
    {
        id: "VL-15",
        title: "Downstream Contract Compatibility",
        statement:
            "Validation SHALL verify compatibility with downstream structural contracts.",
    },
    {
        id: "VL-16",
        title: "Invalid Structure",
        statement:
            "PipelineDefinition that does not conform to Chapter 2 contracts SHALL be classified as invalid structure.",
    },
    {
        id: "VL-17",
        title: "Invalid Expansion",
        statement:
            "WorkflowDefinition that does not conform to Chapter 3 contracts SHALL be classified as invalid expansion.",
    },
    {
        id: "VL-18",
        title: "Invariant Violation",
        statement:
            "Invariant Violation includes any violation of PI-1 through PI-13.",
    },
    {
        id: "VL-19",
        title: "Compatibility Violation",
        statement:
            "Violation of Downstream Contract Compatibility SHALL be classified as compatibility violation.",
    },
    {
        id: "VL-20",
        title: "Validation Outcome Classification",
        statement:
            "Validation outcome SHALL be classified as one of: Valid, Invalid Structure, Invalid Expansion, Invariant Violation, Compatibility Violation.",
    },
];

describe("ASA-ARCH-21.2 Chapter 4 — Validation", () => {
    test("VP-401 artifacts exist", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
    });

    test("VP-402 every VL-1…VL-20 represented with frozen wording", () => {
        expect(VALIDATION_CONTRACT_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(VALIDATION_CONTRACTS).toHaveLength(20);
        for (const e of EXPECTED) {
            const c = getValidationContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
        expect(Object.isFrozen(VALIDATION_CONTRACTS)).toBe(true);
    });

    test("VP-403 principles / boundary / pipeline / workflow / classification coverage", () => {
        expect(getValidationContract("VL-1").category).toBe("principle");
        expect(getValidationContract("VL-6").category).toBe("boundary");
        expect(getValidationContract("VL-9").category).toBe("pipeline_validation");
        expect(getValidationContract("VL-12").category).toBe("workflow_validation");
        expect(getValidationContract("VL-16").category).toBe("classification");
        expect(getValidationContract("VL-20").category).toBe("outcome");
        expect([...VL4_VALIDATION_PHASES]).toEqual([
            "Pipeline Validation (pre-expansion)",
            "Workflow Validation (post-expansion)",
        ]);
        expect([...VL2_FORBIDDEN_VALIDATION_CONCERNS]).toEqual(
            expect.arrayContaining([
                "Runtime semantics",
                "Execution behavior",
                "Execution policy",
                "Scheduler",
                "EnginePool",
                "DispatchStrategy",
            ])
        );
        expect([...VALIDATION_OUTCOME_CLASSIFICATIONS]).toEqual([
            "Valid",
            "Invalid Structure",
            "Invalid Expansion",
            "Invariant Violation",
            "Compatibility Violation",
        ]);
    });

    test("VP-404 no validation engine / algorithm / expansion / graph / cycle detection impl", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative architectural validation contract registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(validate|expand|detectCycle|buildGraph|constructNode)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(ValidationEngine|ValidationExecutor|PipelineValidator|ExpansionEngine|WorkflowCompiler)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/\b(assignEngine|dispatchNode)\s*\(/);
    });

    test("VP-405 read-only / deterministic registry", () => {
        expect(Object.isFrozen(VALIDATION_CONTRACT_IDS)).toBe(true);
        expect(Object.isFrozen(VALIDATION_OUTCOME_CLASSIFICATIONS)).toBe(true);
        expect(getValidationContract("VL-3").statement).toMatch(/deterministic/i);
        expect(() => {
            (VALIDATION_CONTRACTS as unknown as Array<unknown>).push({});
        }).toThrow();
    });

    test("VP-406 preserves PI-* / PD-* / ER-* and outcome classification only", () => {
        expect(PIPELINE_INVARIANT_IDS).toHaveLength(13);
        expect(PIPELINE_PUBLIC_CONTRACT_IDS).toHaveLength(13);
        expect(EXPANSION_RULE_IDS).toHaveLength(15);
        expect(getValidationContract("VL-18").statement).toMatch(/PI-1 through PI-13/);
        expect(getValidationContract("VL-20").statement).toMatch(/classified as one of/);
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(/Chapter 1 Pipeline Invariants/);
        expect(body).toMatch(/Chapter 2 PipelineDefinition Public Contract/);
        expect(body).toMatch(/Chapter 3 Expansion Rules/);
    });
});
