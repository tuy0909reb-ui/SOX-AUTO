import * as fs from "fs";
import * as path from "path";
import {
    ExecutionContract,
    PIPELINE_EXECUTION_CONTRACTS,
    PIPELINE_EXECUTION_CONTRACT_IDS,
    PIPELINE_EXECUTION_CONTRACT_OUTCOME,
    PIPELINE_EXECUTION_CONTRACT_VERIFICATION,
    PipelineExecutionContractId,
    getPipelineExecutionContract,
} from "../../src/workflow/PipelineExecutionContract";
import { PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS } from "../../src/workflow/PipelineExecutionBoundaryContract";
import { PIPELINE_COMPOSITION_CONTRACT_IDS } from "../../src/workflow/PipelineCompositionContract";
import { COMPOSITION_BOUNDARY_CONTRACT_IDS } from "../../src/workflow/CompositionBoundaryContract";
import { COMPOSITION_INTEGRATION_IDS } from "../../src/workflow/CompositionIntegration";
import { COMPOSITION_EVOLUTION_IDS } from "../../src/workflow/CompositionEvolution";
import { COMPOSITION_LIFECYCLE_IDS } from "../../src/workflow/CompositionLifecycle";
import { COMPOSITION_VALIDATION_IDS } from "../../src/workflow/CompositionValidation";
import { COMPOSITION_CONSTRAINT_IDS } from "../../src/workflow/CompositionConstraints";
import { COMPOSITION_INVARIANT_IDS } from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(
    __dirname,
    "../../src/workflow/PipelineExecutionContract.ts"
);
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_pipeline_execution_contract.md"
);

const EXPECTED: Array<{
    id: PipelineExecutionContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "PEC-1",
        title: "Execution Identity",
        statement:
            "Execution structure SHALL have a stable identity. Identity represents contract identity. Identity SHALL NOT represent runtime object identity.",
    },
    {
        id: "PEC-2",
        title: "Execution Type",
        statement:
            "Execution structure SHALL declare descriptive type metadata. Execution Type SHALL NOT select execution engines. Execution Type SHALL NOT determine runtime behavior. Execution Type SHALL NOT control scheduling.",
    },
    {
        id: "PEC-3",
        title: "Input Contract",
        statement:
            "Execution structure SHALL declare required inputs. Input Contract defines structural input expectations. Input Contract SHALL NOT define data acquisition, validation logic, transformation logic, or runtime retrieval process.",
    },
    {
        id: "PEC-4",
        title: "Output Contract",
        statement:
            "Execution structure SHALL declare produced outputs. Output Contract defines structural output representation. Output Contract SHALL NOT define output generation process, storage mechanism, delivery mechanism, or runtime publishing logic.",
    },
    {
        id: "PEC-5",
        title: "Responsibility Boundary",
        statement:
            "Execution structure SHALL declare responsibility boundaries. Responsibility Boundary defines contract responsibility range and structural ownership boundary. Responsibility Boundary SHALL NOT assign runtime ownership, select execution authority, or define operational responsibility.",
    },
    {
        id: "PEC-6",
        title: "Compatibility Declaration",
        statement:
            "Execution structures SHALL provide compatibility information. Compatibility Declaration supports contract validation, future tooling compatibility, and version boundary control.",
    },
    {
        id: "PEC-7",
        title: "Declarative Restriction",
        statement:
            "Pipeline Execution Contract SHALL remain declarative. The contract describes structure only. Executable functions, algorithms, runtime instructions, and workflow commands SHALL remain outside this chapter.",
    },
    {
        id: "PEC-8",
        title: "Runtime Isolation",
        statement:
            "Execution Contract SHALL remain isolated from runtime implementation. Execution Contract MUST NOT contain runtime objects, executable functions, scheduler references, dispatcher references, engine references, or resource references.",
    },
    {
        id: "PEC-9",
        title: "Boundary Preservation",
        statement:
            "Pipeline Execution Contract SHALL preserve boundaries defined by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, and Chapter 13 Pipeline Execution Boundary Contract. Chapter 14 extensions SHALL NOT replace previous frozen contracts.",
    },
    {
        id: "PEC-10",
        title: "Future Runtime Compatibility",
        statement:
            "Execution Contract SHALL provide a stable structural foundation for future runtime layers. Future runtime systems MAY consume Execution Identity, Input Contract, Output Contract, and Compatibility Information. Future runtime systems SHALL NOT require modification of Chapter 14 contract semantics.",
    },
    {
        id: "PEC-11",
        title: "Execution Scope Boundary",
        statement:
            "Execution Contract SHALL declare structural execution scope. Execution Scope Boundary defines scope of represented execution structure and structural containment boundary. Execution Scope Boundary SHALL NOT define execution order, execution sequence, runtime workflow, scheduler behavior, or nested runtime ownership.",
    },
];

describe("ASA-ARCH-21.3 Chapter 14 — Pipeline Execution Contract", () => {
    test("PEC-1 through PEC-11 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(PIPELINE_EXECUTION_CONTRACT_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(PIPELINE_EXECUTION_CONTRACTS).toHaveLength(11);
        for (const e of EXPECTED) {
            const c = getPipelineExecutionContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("ExecutionContract structural type model is declarative-only", () => {
        const sample: ExecutionContract = Object.freeze({
            executionId: "pipeline.execution.customer_analysis.v1",
            executionType: "pipeline",
            inputContract: Object.freeze([
                Object.freeze({
                    name: "marketData",
                    source: "pipeline.output",
                }),
            ]),
            outputContract: Object.freeze([
                Object.freeze({ name: "analysisResult" }),
            ]),
            responsibilityBoundary: Object.freeze({
                scope: "structural-definition",
            }),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            executionScopeBoundary: Object.freeze({
                scope: "structural-execution",
            }),
        });

        expect(sample.executionId).toBe(
            "pipeline.execution.customer_analysis.v1"
        );
        expect(sample.executionType).toBe("pipeline");
        expect(sample.inputContract[0].name).toBe("marketData");
        expect(sample.outputContract[0].name).toBe("analysisResult");
        expect(sample.responsibilityBoundary.scope).toBe(
            "structural-definition"
        );
        expect(sample.compatibility.contract).toBe("ASA-ARCH-21.3");
        expect(sample.executionScopeBoundary.scope).toBe(
            "structural-execution"
        );
        expect(Object.isFrozen(sample)).toBe(true);

        // Structural fields only — no engine/scheduler/dispatch keys
        expect(Object.keys(sample).sort()).toEqual([
            "compatibility",
            "executionId",
            "executionScopeBoundary",
            "executionType",
            "inputContract",
            "outputContract",
            "responsibilityBoundary",
        ]);
    });

    test("Execution Contract Verification and Outcome are preserved", () => {
        expect([...PIPELINE_EXECUTION_CONTRACT_VERIFICATION]).toEqual([
            "ExecutionGraph creation",
            "Scheduling strategy",
            "Dispatch algorithm",
            "Engine selection",
            "Runtime binding",
            "Resource allocation",
            "Execution algorithms",
            "Runtime lifecycle management",
            "Failure recovery",
            "Performance optimization",
        ]);
        expect(Object.isFrozen(PIPELINE_EXECUTION_CONTRACT_VERIFICATION)).toBe(
            true
        );
        expect(PIPELINE_EXECUTION_CONTRACT_OUTCOME.statement).toMatch(
            /structural foundation for subsequent Runtime/
        );
        expect(PIPELINE_EXECUTION_CONTRACT_OUTCOME.scope).toMatch(
            /Pipeline structural execution contracts only/
        );
        expect(PIPELINE_EXECUTION_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(PIPELINE_EXECUTION_CONTRACT_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no runtime / ExecutionGraph / scheduling", () => {
        expect(Object.isFrozen(PIPELINE_EXECUTION_CONTRACTS)).toBe(true);
        expect(Object.isFrozen(PIPELINE_EXECUTION_CONTRACT_IDS)).toBe(true);
        expect(() => {
            (PIPELINE_EXECUTION_CONTRACTS as unknown as Array<unknown>).push(
                {}
            );
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural Pipeline execution contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindRuntime|buildExecutionGraph|manageState|selectEngine)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
        expect(body).not.toMatch(/\bretryPolicy\b/);
        expect(body).not.toMatch(/\bengine\s*:/);
    });

    test("preserves frozen Chapter 1–13 contracts; Ch11–Ch13 unchanged", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS).toHaveLength(10);
        expect(COMPOSITION_CONSTRAINT_IDS).toHaveLength(10);
        expect(COMPOSITION_VALIDATION_IDS).toHaveLength(10);
        expect(COMPOSITION_LIFECYCLE_IDS).toHaveLength(10);
        expect(COMPOSITION_EVOLUTION_IDS).toHaveLength(10);
        expect(COMPOSITION_INTEGRATION_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_EXECUTION_CONTRACT_IDS[0]).toBe("PEC-1");
        expect(PIPELINE_EXECUTION_CONTRACT_IDS[10]).toBe("PEC-11");
        expect(getPipelineExecutionContract("PEC-9").statement).toMatch(
            /Chapter 13 Pipeline Execution Boundary Contract/
        );
        expect(getPipelineExecutionContract("PEC-11").statement).toMatch(
            /SHALL NOT define execution order/
        );
    });
});
