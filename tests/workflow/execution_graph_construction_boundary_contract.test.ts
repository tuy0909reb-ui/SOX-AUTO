import * as fs from "fs";
import * as path from "path";
import {
    ConstructionBoundary,
    EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACTS,
    EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS,
    EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_OUTCOME,
    EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_VERIFICATION,
    ExecutionGraphConstructionBoundaryContractId,
    getExecutionGraphConstructionBoundaryContract,
} from "../../src/workflow/ExecutionGraphConstructionBoundaryContract";
import { EXECUTION_GRAPH_CONTRACT_IDS } from "../../src/workflow/ExecutionGraphContract";
import { EXECUTION_DEFINITION_CONTRACT_IDS } from "../../src/workflow/ExecutionDefinitionContract";
import { PIPELINE_EXECUTION_CONTRACT_IDS } from "../../src/workflow/PipelineExecutionContract";
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
    "../../src/workflow/ExecutionGraphConstructionBoundaryContract.ts"
);
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_execution_graph_construction_boundary_contract.md"
);

const EXPECTED: Array<{
    id: ExecutionGraphConstructionBoundaryContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "CBC-1",
        title: "Boundary Identity",
        statement:
            "Construction Boundary SHALL have a stable identity. Identity represents structural boundary identity. Identity SHALL NOT represent runtime instances.",
    },
    {
        id: "CBC-2",
        title: "Construction Ownership",
        statement:
            "Construction Boundary SHALL declare ownership of construction responsibilities. Ownership SHALL NOT include implementation responsibilities.",
    },
    {
        id: "CBC-3",
        title: "Construction Input Boundary",
        statement:
            "Construction Boundary SHALL define the structural input accepted by future construction architecture. Construction Input Boundary SHALL identify accepted contract types only. Construction Input Boundary SHALL NOT define transformation behavior.",
    },
    {
        id: "CBC-4",
        title: "Output Boundary",
        statement:
            "Construction Boundary SHALL define the structural boundary through which downstream construction architecture receives declarative contracts. Output Boundary SHALL NOT define runtime representations.",
    },
    {
        id: "CBC-5",
        title: "Responsibility Boundary",
        statement:
            "Construction Boundary SHALL define the responsibility transition between declarative graph architecture and construction architecture. No execution responsibility SHALL be introduced.",
    },
    {
        id: "CBC-6",
        title: "Compatibility",
        statement:
            "Construction Boundary SHALL declare compatibility metadata. Compatibility supports contract verification, boundary verification, and future compatibility.",
    },
    {
        id: "CBC-7",
        title: "Construction Scope",
        statement:
            "Construction Boundary SHALL define structural construction scope. Construction Scope SHALL NOT define construction algorithms, runtime behavior, scheduling, or dispatch.",
    },
    {
        id: "CBC-8",
        title: "Declarative Restriction",
        statement:
            "Construction Boundary SHALL remain declarative. Executable functions, build procedures, construction procedures, and runtime instructions SHALL remain outside this chapter.",
    },
    {
        id: "CBC-9",
        title: "Runtime Isolation",
        statement:
            "Construction Boundary SHALL remain runtime independent. Construction Boundary MUST NOT contain runtime objects, runtime instances, scheduler references, dispatcher references, engine references, or runtime graph references.",
    },
    {
        id: "CBC-10",
        title: "Boundary Preservation",
        statement:
            "Construction Boundary SHALL preserve boundaries established by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, Chapter 13 Pipeline Execution Boundary Contract, Chapter 14 Pipeline Execution Contract, Chapter 15 Execution Definition Contract, and Chapter 16 Execution Graph Contract. Previous frozen contracts SHALL NOT be modified.",
    },
    {
        id: "CBC-11",
        title: "Future Construction Compatibility",
        statement:
            "Construction Boundary SHALL provide stable architectural input for future construction architecture. Future construction architecture MAY consume this Construction Boundary. Future construction architecture SHALL NOT require modification of this contract.",
    },
    {
        id: "CBC-12",
        title: "Construction Transition",
        statement:
            "Construction Boundary SHALL define only the architectural transition into construction architecture. Transition SHALL NOT define construction sequence, construction timing, construction implementation, or runtime execution.",
    },
];

describe("ASA-ARCH-21.3 Chapter 17 — Execution Graph Construction Boundary Contract", () => {
    test("CBC-1 through CBC-12 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACTS).toHaveLength(
            12
        );
        for (const e of EXPECTED) {
            const c = getExecutionGraphConstructionBoundaryContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("ConstructionBoundary structural type model is declarative boundary-only", () => {
        const sample: ConstructionBoundary = Object.freeze({
            boundaryId: "construction.boundary.execution_graph.v1",
            inputContract: Object.freeze({
                acceptedContractTypes: Object.freeze([
                    "ExecutionGraphContract",
                    "ExecutionDefinitionContract",
                ]),
            }),
            inputBoundary: Object.freeze({
                ownershipBoundary: "declarative-graph-contracts",
            }),
            outputBoundary: Object.freeze({
                exposedContractType: "ConstructionBoundary",
            }),
            responsibilityBoundary: Object.freeze({
                from: "declarative-graph-architecture",
                to: "construction-architecture",
            }),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            constructionScope: Object.freeze({
                scope: "boundary-only",
            }),
        });

        expect(sample.boundaryId).toBe(
            "construction.boundary.execution_graph.v1"
        );
        expect(sample.inputContract.acceptedContractTypes).toContain(
            "ExecutionGraphContract"
        );
        expect(sample.responsibilityBoundary.to).toBe(
            "construction-architecture"
        );
        expect(sample.constructionScope.scope).toBe("boundary-only");
        expect(Object.isFrozen(sample)).toBe(true);

        expect(Object.keys(sample).sort()).toEqual([
            "boundaryId",
            "compatibility",
            "constructionScope",
            "inputBoundary",
            "inputContract",
            "outputBoundary",
            "responsibilityBoundary",
        ]);
    });

    test("Construction Boundary Verification and Outcome are preserved", () => {
        expect([
            ...EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_VERIFICATION,
        ]).toEqual([
            "Builder",
            "Factory",
            "Compiler",
            "Generator",
            "Construction Pipeline",
            "Construction Procedure",
            "Graph Construction",
            "Graph Generation",
            "Graph Transformation",
            "Runtime Representation Construction",
            "Scheduling",
            "Dispatch",
            "Engine Assignment",
            "Runtime Binding",
            "Runtime Lifecycle",
            "Validation Algorithms",
            "Optimization Algorithms",
        ]);
        expect(
            Object.isFrozen(
                EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_VERIFICATION
            )
        ).toBe(true);
        expect(
            EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_OUTCOME.statement
        ).toMatch(
            /architectural boundary foundation for subsequent Construction Contract/
        );
        expect(
            EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_OUTCOME.scope
        ).toMatch(/structural construction boundary contracts only/);
        expect(
            EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_OUTCOME.exclusion
        ).toMatch(/Behavioral semantics are intentionally excluded/);
        expect(
            Object.isFrozen(
                EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_OUTCOME
            )
        ).toBe(true);
    });

    test("registry is immutable; declarative-only; no builder / factory / construction", () => {
        expect(
            Object.isFrozen(EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACTS)
        ).toBe(true);
        expect(
            Object.isFrozen(EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS)
        ).toBe(true);
        expect(() => {
            (
                EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACTS as unknown as Array<unknown>
            ).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural Execution Graph Construction Boundary contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindRuntime|buildExecutionGraph|constructGraph|transformGraph|generateGraph|createBuilder|createFactory)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher|GraphBuilder|GraphFactory|GraphCompiler|GraphGenerator)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
        expect(body).not.toMatch(/\bretryPolicy\b/);
        expect(body).not.toMatch(/\bengine\s*:/);
    });

    test("preserves frozen Chapter 1–16; Ch11 CBC registry remains distinct", () => {
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
        expect(PIPELINE_EXECUTION_CONTRACT_IDS).toHaveLength(11);
        expect(EXECUTION_DEFINITION_CONTRACT_IDS).toHaveLength(12);
        expect(EXECUTION_GRAPH_CONTRACT_IDS).toHaveLength(12);
        expect(EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS).toHaveLength(
            12
        );
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS[0]).toBe("CBC-1");
        expect(
            EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS[0]
        ).toBe("CBC-1");
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(
            EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS[11]
        ).toBe("CBC-12");
        expect(
            getExecutionGraphConstructionBoundaryContract("CBC-10").statement
        ).toMatch(/Chapter 16 Execution Graph Contract/);
        expect(
            getExecutionGraphConstructionBoundaryContract("CBC-12").statement
        ).toMatch(/SHALL NOT define construction sequence/);
    });
});
