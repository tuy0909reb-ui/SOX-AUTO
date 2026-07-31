import * as fs from "fs";
import * as path from "path";
import {
    ExecutionGraph,
    EXECUTION_GRAPH_CONTRACTS,
    EXECUTION_GRAPH_CONTRACT_IDS,
    EXECUTION_GRAPH_CONTRACT_OUTCOME,
    EXECUTION_GRAPH_CONTRACT_VERIFICATION,
    ExecutionGraphContractId,
    getExecutionGraphContract,
} from "../../src/workflow/ExecutionGraphContract";
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
    "../../src/workflow/ExecutionGraphContract.ts"
);
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_execution_graph_contract.md"
);

const EXPECTED: Array<{
    id: ExecutionGraphContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "EGC-1",
        title: "Graph Identity",
        statement:
            "Execution Graph SHALL have a stable identity. Identity represents structural graph identity. Identity SHALL NOT represent runtime instance identity.",
    },
    {
        id: "EGC-2",
        title: "Graph Node",
        statement:
            "Execution Graph SHALL declare graph nodes. Graph Node SHALL define only structural metadata. Graph Node SHALL NOT include runtime state, executable behavior, scheduling information, or engine assignment.",
    },
    {
        id: "EGC-3",
        title: "Graph Edge",
        statement:
            "Execution Graph SHALL declare structural graph edges. Graph Edge SHALL define edge identity, source node, target node, and structural relationship. Graph Edge SHALL NOT define execution order, runtime sequencing, scheduling behavior, or runtime communication.",
    },
    {
        id: "EGC-4",
        title: "Entry Node",
        statement:
            "Execution Graph SHALL declare entry nodes. Entry Node SHALL identify graph entry points only. Entry Node SHALL NOT define runtime invocation behavior.",
    },
    {
        id: "EGC-5",
        title: "Exit Node",
        statement:
            "Execution Graph SHALL declare exit nodes. Exit Node SHALL identify graph termination points only. Exit Node SHALL NOT define runtime completion behavior.",
    },
    {
        id: "EGC-6",
        title: "Graph Compatibility",
        statement:
            "Execution Graph SHALL declare compatibility metadata. Graph Compatibility supports contract validation, version verification, and future runtime compatibility.",
    },
    {
        id: "EGC-7",
        title: "Graph Scope",
        statement:
            "Execution Graph SHALL declare structural graph scope. Graph Scope SHALL NOT define runtime orchestration, scheduling behavior, or execution workflow.",
    },
    {
        id: "EGC-8",
        title: "Graph Boundary",
        statement:
            "Execution Graph SHALL declare graph boundary. Graph Boundary SHALL define graph ownership limit and graph containment boundary. Graph Boundary SHALL NOT define runtime ownership, runtime responsibility, or runtime lifecycle.",
    },
    {
        id: "EGC-9",
        title: "Runtime Isolation",
        statement:
            "Execution Graph SHALL remain runtime independent. Execution Graph MUST NOT contain runtime objects, runtime instances, scheduler references, dispatcher references, engine references, or resource references.",
    },
    {
        id: "EGC-10",
        title: "Boundary Preservation",
        statement:
            "Execution Graph SHALL preserve boundaries established by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, Chapter 13 Pipeline Execution Boundary Contract, Chapter 14 Pipeline Execution Contract, and Chapter 15 Execution Definition Contract. Previous frozen contracts SHALL NOT be modified.",
    },
    {
        id: "EGC-11",
        title: "Future Runtime Compatibility",
        statement:
            "Execution Graph SHALL provide stable structural input for future runtime construction architecture. Future runtime construction SHALL NOT require modification of this contract.",
    },
    {
        id: "EGC-12",
        title: "Graph Integrity",
        statement:
            "Execution Graph SHALL satisfy structural integrity. Graph Integrity SHALL require unique graph identity, valid node references, valid edge references, valid entry node references, valid exit node references, and no orphan edge references. Graph Integrity SHALL NOT define validation algorithms, optimization algorithms, or repair procedures.",
    },
];

describe("ASA-ARCH-21.3 Chapter 16 — Execution Graph Contract", () => {
    test("EGC-1 through EGC-12 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(EXECUTION_GRAPH_CONTRACT_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(EXECUTION_GRAPH_CONTRACTS).toHaveLength(12);
        for (const e of EXPECTED) {
            const c = getExecutionGraphContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("ExecutionGraph structural type model is static and declarative-only", () => {
        const sample: ExecutionGraph = Object.freeze({
            graphId: "pipeline.graph.customer_analysis.v1",
            nodes: Object.freeze([
                Object.freeze({ nodeId: "node-a", nodeType: "transform" }),
                Object.freeze({ nodeId: "node-b", nodeType: "aggregate" }),
            ]),
            edges: Object.freeze([
                Object.freeze({
                    edgeId: "edge-a-b",
                    sourceNodeId: "node-a",
                    targetNodeId: "node-b",
                    relationship: "structurally-connected-to",
                }),
            ]),
            entryNodes: Object.freeze(["node-a"]),
            exitNodes: Object.freeze(["node-b"]),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            graphScope: Object.freeze({ scope: "structural-graph" }),
            graphBoundary: Object.freeze({
                ownershipLimit: "graph-only",
                containmentBoundary: "static-topology",
            }),
            integrity: Object.freeze({
                requiresUniqueGraphIdentity: true as const,
                requiresValidNodeReferences: true as const,
                requiresValidEdgeReferences: true as const,
                requiresValidEntryNodeReferences: true as const,
                requiresValidExitNodeReferences: true as const,
                requiresNoOrphanEdgeReferences: true as const,
            }),
        });

        expect(sample.graphId).toBe("pipeline.graph.customer_analysis.v1");
        expect(sample.nodes).toHaveLength(2);
        expect(sample.edges[0].relationship).toBe(
            "structurally-connected-to"
        );
        expect(sample.entryNodes).toEqual(["node-a"]);
        expect(sample.exitNodes).toEqual(["node-b"]);
        expect(sample.integrity.requiresNoOrphanEdgeReferences).toBe(true);
        expect(Object.isFrozen(sample)).toBe(true);

        expect(Object.keys(sample).sort()).toEqual([
            "compatibility",
            "edges",
            "entryNodes",
            "exitNodes",
            "graphBoundary",
            "graphId",
            "graphScope",
            "integrity",
            "nodes",
        ]);
    });

    test("Execution Graph Verification and Outcome are preserved", () => {
        expect([...EXECUTION_GRAPH_CONTRACT_VERIFICATION]).toEqual([
            "Graph construction",
            "Execution Definition transformation",
            "Graph generation",
            "Graph validation",
            "Graph traversal",
            "Graph optimization",
            "Topological sorting",
            "Cycle detection",
            "Runtime representation construction",
            "Scheduling",
            "Dispatch",
            "Engine selection",
            "Runtime binding",
            "Runtime lifecycle",
            "Runtime execution",
        ]);
        expect(Object.isFrozen(EXECUTION_GRAPH_CONTRACT_VERIFICATION)).toBe(
            true
        );
        expect(EXECUTION_GRAPH_CONTRACT_OUTCOME.statement).toMatch(
            /static declarative graph foundation for subsequent Runtime Construction/
        );
        expect(EXECUTION_GRAPH_CONTRACT_OUTCOME.scope).toMatch(
            /structural execution graph contracts only/
        );
        expect(EXECUTION_GRAPH_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(EXECUTION_GRAPH_CONTRACT_OUTCOME)).toBe(true);
    });

    test("registry is immutable; declarative-only; no construction / validation / traversal", () => {
        expect(Object.isFrozen(EXECUTION_GRAPH_CONTRACTS)).toBe(true);
        expect(Object.isFrozen(EXECUTION_GRAPH_CONTRACT_IDS)).toBe(true);
        expect(() => {
            (EXECUTION_GRAPH_CONTRACTS as unknown as Array<unknown>).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural Execution Graph contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindRuntime|buildExecutionGraph|constructGraph|traverseGraph|topologicalSort|detectCycle|transformDefinition|generateGraph|repairGraph)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher|GraphValidator|GraphTransformer)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
        expect(body).not.toMatch(/\bretryPolicy\b/);
        expect(body).not.toMatch(/\bengine\s*:/);
    });

    test("preserves frozen Chapter 1–15 contracts; Ch11–Ch15 unchanged", () => {
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
        expect(EXECUTION_GRAPH_CONTRACT_IDS[0]).toBe("EGC-1");
        expect(EXECUTION_GRAPH_CONTRACT_IDS[11]).toBe("EGC-12");
        expect(getExecutionGraphContract("EGC-10").statement).toMatch(
            /Chapter 15 Execution Definition Contract/
        );
        expect(getExecutionGraphContract("EGC-12").statement).toMatch(
            /SHALL NOT define validation algorithms/
        );
    });
});
