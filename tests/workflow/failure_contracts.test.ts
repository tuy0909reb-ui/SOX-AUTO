import * as fs from "fs";
import * as path from "path";
import {
    FAILURE_CATEGORIES,
    FAILURE_CONTRACT_IDS,
    FAILURE_CONTRACTS,
    FL_FORBIDDEN_BEHAVIORAL_CONCERNS,
    FailureContractId,
    getFailureContract,
} from "../../src/workflow/FailureContracts";
import { PIPELINE_INVARIANT_IDS } from "../../src/workflow/PipelineInvariants";
import { PIPELINE_PUBLIC_CONTRACT_IDS } from "../../src/workflow/PipelinePublicContract";
import { EXPANSION_RULE_IDS } from "../../src/workflow/ExpansionRules";
import { VALIDATION_CONTRACT_IDS } from "../../src/workflow/ValidationContracts";

const SRC = path.resolve(__dirname, "../../src/workflow/FailureContracts.ts");
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_2_failure_contract.md"
);

const EXPECTED: Array<{ id: FailureContractId; title: string; statement: string }> = [
    {
        id: "FL-1",
        title: "Declarative Failure",
        statement:
            "Failure Contract SHALL define failure categories and semantics only.",
    },
    {
        id: "FL-2",
        title: "Structural Failure Only",
        statement:
            "Failure SHALL be defined only in terms of structural semantics.",
    },
    {
        id: "FL-3",
        title: "Pre-runtime Detectability",
        statement: "Failure SHALL be detectable before runtime execution.",
    },
    {
        id: "FL-4",
        title: "Deterministic Failure",
        statement: "Failure SHALL be deterministic.",
    },
    {
        id: "FL-5",
        title: "Failure Is Not Behavior",
        statement:
            "Failure Contract SHALL NOT define exception types, error codes, logging, UI display, runtime stop behavior, Orchestrator error handling, or Retry / Timeout / Backoff.",
    },
    {
        id: "FL-6",
        title: "Failure Is Not Recovery",
        statement: "Failure Contract SHALL NOT define recovery behavior.",
    },
    {
        id: "FL-7",
        title: "Structural Scope Only",
        statement: "Failure Contract applies only to structural processing.",
    },
    {
        id: "FL-8",
        title: "Invalid Structure",
        statement:
            "Invalid Structure SHALL be defined as: PipelineDefinition that does not conform to Chapter 2 structural contracts.",
    },
    {
        id: "FL-9",
        title: "Invalid Expansion",
        statement:
            "Invalid Expansion SHALL be defined as: WorkflowDefinition that does not conform to Chapter 3 expansion contracts.",
    },
    {
        id: "FL-10",
        title: "Invariant Violation",
        statement:
            "Invariant Violation SHALL be defined as: any violation of Pipeline Invariants (PI-1 through PI-13).",
    },
    {
        id: "FL-11",
        title: "Compatibility Violation",
        statement:
            "Compatibility Violation SHALL be defined as: a state that does not conform to downstream structural contracts.",
    },
    {
        id: "FL-12",
        title: "Structural Non-continuability",
        statement: "Failure indicates structural non-continuability.",
    },
    {
        id: "FL-13",
        title: "Structurally Terminal",
        statement: "Failure SHALL be structurally terminal.",
    },
    {
        id: "FL-14",
        title: "Semantically Non-recoverable",
        statement:
            "Failure SHALL be semantically non-recoverable at the structural level.",
    },
    {
        id: "FL-15",
        title: "Structural Validation Determines Failure",
        statement:
            "Failure categories are determined through structural validation.",
    },
    {
        id: "FL-16",
        title: "Deterministic Determination",
        statement: "Failure determination SHALL be deterministic.",
    },
    {
        id: "FL-17",
        title: "Failure Category",
        statement:
            "Failure Category SHALL be one of: Invalid Structure, Invalid Expansion, Invariant Violation, Compatibility Violation.",
    },
];

describe("ASA-ARCH-21.2 Chapter 5 — Failure Contract", () => {
    test("FL-1 through FL-17 registration and completeness", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(FAILURE_CONTRACT_IDS).toEqual(EXPECTED.map((e) => e.id));
        expect(FAILURE_CONTRACTS).toHaveLength(17);
        for (const e of EXPECTED) {
            const c = getFailureContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("registry immutability, read-only exposure, deterministic ordering", () => {
        expect(Object.isFrozen(FAILURE_CONTRACTS)).toBe(true);
        expect(Object.isFrozen(FAILURE_CONTRACT_IDS)).toBe(true);
        expect(Object.isFrozen(FAILURE_CATEGORIES)).toBe(true);
        expect([...FAILURE_CATEGORIES]).toEqual([
            "Invalid Structure",
            "Invalid Expansion",
            "Invariant Violation",
            "Compatibility Violation",
        ]);
        expect(FAILURE_CONTRACT_IDS[0]).toBe("FL-1");
        expect(FAILURE_CONTRACT_IDS[16]).toBe("FL-17");
        expect(() => {
            (FAILURE_CONTRACTS as unknown as Array<unknown>).push({});
        }).toThrow();
    });

    test("no behavioral implementation; no runtime / WorkflowBuilder / ExecutionGraph / validation / expansion deps", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative architectural failure contract registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(handleFailure|recover|retry|validate|expand|buildGraph|throwError)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(FailureHandler|Exception|ValidationEngine|ExpansionEngine|WorkflowBuilder|ExecutionGraph)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
        expect(body).not.toMatch(/from\s+["']\.\/PipelineDefinition/);
        expect(body).not.toMatch(/from\s+["']\.\/ValidationContracts/);
        expect(body).not.toMatch(/from\s+["']\.\/ExpansionRules/);
        expect([...FL_FORBIDDEN_BEHAVIORAL_CONCERNS]).toEqual(
            expect.arrayContaining([
                "Exception types",
                "Error codes",
                "Logging",
                "Retry",
                "Timeout",
            ])
        );
    });

    test("preserves frozen Chapters 1–4 registries", () => {
        expect(PIPELINE_INVARIANT_IDS).toHaveLength(13);
        expect(PIPELINE_PUBLIC_CONTRACT_IDS).toHaveLength(13);
        expect(EXPANSION_RULE_IDS).toHaveLength(15);
        expect(VALIDATION_CONTRACT_IDS).toHaveLength(20);
        expect(getFailureContract("FL-1").category).toBe("principle");
        expect(getFailureContract("FL-5").category).toBe("boundary");
        expect(getFailureContract("FL-8").category).toBe("failure_category");
        expect(getFailureContract("FL-12").category).toBe("semantics");
        expect(getFailureContract("FL-15").category).toBe("determination");
        expect(getFailureContract("FL-17").category).toBe("category_contract");
    });
});
