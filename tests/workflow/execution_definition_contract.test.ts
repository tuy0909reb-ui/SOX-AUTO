import * as fs from "fs";
import * as path from "path";
import {
    ExecutionDefinition,
    EXECUTION_DEFINITION_CONTRACTS,
    EXECUTION_DEFINITION_CONTRACT_IDS,
    EXECUTION_DEFINITION_CONTRACT_OUTCOME,
    EXECUTION_DEFINITION_CONTRACT_VERIFICATION,
    ExecutionDefinitionContractId,
    getExecutionDefinitionContract,
} from "../../src/workflow/ExecutionDefinitionContract";
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
    "../../src/workflow/ExecutionDefinitionContract.ts"
);
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_execution_definition_contract.md"
);

const EXPECTED: Array<{
    id: ExecutionDefinitionContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "EDC-1",
        title: "Definition Identity",
        statement:
            "Execution Definition SHALL have a stable identity. Identity represents structural definition identity. Identity SHALL NOT represent runtime instance identity.",
    },
    {
        id: "EDC-2",
        title: "Definition Type",
        statement:
            "Execution Definition SHALL declare descriptive metadata. Definition Type SHALL NOT control runtime behavior. Definition Type SHALL NOT select execution engines. Definition Type SHALL NOT control scheduling.",
    },
    {
        id: "EDC-3",
        title: "Node Definition",
        statement:
            "Execution Definition SHALL describe execution nodes. Node Definition SHALL define only structural metadata. Node Definition SHALL NOT include executable code, runtime state, scheduling information, or engine assignment.",
    },
    {
        id: "EDC-4",
        title: "Endpoint Definition",
        statement:
            "Execution Definition SHALL describe structural endpoints. Endpoint Definition SHALL define input endpoint, output endpoint, and interface metadata. Endpoint Definition SHALL NOT define communication protocol, runtime transport, or invocation behavior.",
    },
    {
        id: "EDC-5",
        title: "Structural Dependency Metadata",
        statement:
            "Execution Definition SHALL declare structural dependencies. Structural Dependency Metadata SHALL define structural dependency and definition relationship. Structural Dependency Metadata SHALL NOT define runtime ordering, scheduling sequence, execution timing, or graph edges.",
    },
    {
        id: "EDC-6",
        title: "Compatibility Declaration",
        statement:
            "Execution Definition SHALL declare compatibility metadata. Compatibility Declaration supports contract validation, version verification, and future runtime compatibility.",
    },
    {
        id: "EDC-7",
        title: "Declarative Restriction",
        statement:
            "Execution Definition SHALL remain declarative. Executable functions, algorithms, runtime instructions, and workflow commands SHALL remain outside this chapter.",
    },
    {
        id: "EDC-8",
        title: "Runtime Isolation",
        statement:
            "Execution Definition SHALL remain runtime independent. Execution Definition MUST NOT contain runtime objects, runtime instances, ExecutionGraph references, scheduler references, dispatcher references, engine references, or resource references.",
    },
    {
        id: "EDC-9",
        title: "Boundary Preservation",
        statement:
            "Execution Definition SHALL preserve boundaries established by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, Chapter 13 Pipeline Execution Boundary Contract, and Chapter 14 Pipeline Execution Contract. Previous frozen contracts SHALL NOT be modified.",
    },
    {
        id: "EDC-10",
        title: "Future Runtime Compatibility",
        statement:
            "Execution Definition SHALL provide stable structural input for future runtime architecture. Future runtime MAY reference Execution Definition. Future runtime SHALL NOT require modification of this contract.",
    },
    {
        id: "EDC-11",
        title: "Definition Scope",
        statement:
            "Execution Definition SHALL declare structural definition scope. Definition Scope SHALL NOT define runtime workflow, execution sequence, scheduling behavior, engine ownership, or runtime orchestration.",
    },
    {
        id: "EDC-12",
        title: "Definition Boundary",
        statement:
            "Execution Definition SHALL declare its structural boundary. Definition Boundary SHALL define structural ownership limit and definition containment boundary. Definition Boundary SHALL NOT define runtime ownership, runtime lifecycle, or runtime execution responsibility.",
    },
];

describe("ASA-ARCH-21.3 Chapter 15 — Execution Definition Contract", () => {
    test("EDC-1 through EDC-12 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(EXECUTION_DEFINITION_CONTRACT_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(EXECUTION_DEFINITION_CONTRACTS).toHaveLength(12);
        for (const e of EXPECTED) {
            const c = getExecutionDefinitionContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("ExecutionDefinition structural type model is static and declarative-only", () => {
        const sample: ExecutionDefinition = Object.freeze({
            definitionId: "pipeline.definition.customer_analysis.v1",
            definitionType: "pipeline",
            nodes: Object.freeze([
                Object.freeze({ nodeId: "node-a", nodeType: "transform" }),
                Object.freeze({ nodeId: "node-b", nodeType: "aggregate" }),
            ]),
            endpoints: Object.freeze([
                Object.freeze({
                    endpointId: "in-market",
                    kind: "input" as const,
                    interfaceMetadata: "marketData",
                }),
                Object.freeze({
                    endpointId: "out-result",
                    kind: "output" as const,
                    interfaceMetadata: "analysisResult",
                }),
            ]),
            structuralDependencies: Object.freeze([
                Object.freeze({
                    from: "node-a",
                    to: "node-b",
                    relationship: "structurally-depends-on",
                }),
            ]),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            definitionScope: Object.freeze({
                scope: "structural-definition",
            }),
            definitionBoundary: Object.freeze({
                ownershipLimit: "definition-only",
                containmentBoundary: "static-structure",
            }),
        });

        expect(sample.definitionId).toBe(
            "pipeline.definition.customer_analysis.v1"
        );
        expect(sample.nodes).toHaveLength(2);
        expect(sample.endpoints[0].kind).toBe("input");
        expect(sample.structuralDependencies[0].relationship).toBe(
            "structurally-depends-on"
        );
        expect(sample.definitionBoundary.ownershipLimit).toBe(
            "definition-only"
        );
        expect(Object.isFrozen(sample)).toBe(true);

        expect(Object.keys(sample).sort()).toEqual([
            "compatibility",
            "definitionBoundary",
            "definitionId",
            "definitionScope",
            "definitionType",
            "endpoints",
            "nodes",
            "structuralDependencies",
        ]);
    });

    test("Execution Definition Verification and Outcome are preserved", () => {
        expect([...EXECUTION_DEFINITION_CONTRACT_VERIFICATION]).toEqual([
            "ExecutionGraph generation",
            "Execution Definition transformation",
            "Runtime representation construction",
            "Graph construction",
            "Graph traversal",
            "Scheduling strategy",
            "Dispatch algorithm",
            "Engine selection",
            "Runtime binding",
            "Resource allocation",
            "Runtime lifecycle",
            "Execution algorithms",
            "Runtime execution",
        ]);
        expect(
            Object.isFrozen(EXECUTION_DEFINITION_CONTRACT_VERIFICATION)
        ).toBe(true);
        expect(EXECUTION_DEFINITION_CONTRACT_OUTCOME.statement).toMatch(
            /static declarative foundation for subsequent Runtime Construction/
        );
        expect(EXECUTION_DEFINITION_CONTRACT_OUTCOME.scope).toMatch(
            /structural execution definition contracts only/
        );
        expect(EXECUTION_DEFINITION_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(EXECUTION_DEFINITION_CONTRACT_OUTCOME)).toBe(
            true
        );
    });

    test("registry is immutable; declarative-only; no runtime / ExecutionGraph / transformation", () => {
        expect(Object.isFrozen(EXECUTION_DEFINITION_CONTRACTS)).toBe(true);
        expect(Object.isFrozen(EXECUTION_DEFINITION_CONTRACT_IDS)).toBe(true);
        expect(() => {
            (EXECUTION_DEFINITION_CONTRACTS as unknown as Array<unknown>).push(
                {}
            );
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural Execution Definition contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindRuntime|buildExecutionGraph|transformDefinition|constructGraph|traverseGraph)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher|DefinitionTransformer)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
        expect(body).not.toMatch(/\bretryPolicy\b/);
        expect(body).not.toMatch(/\bengine\s*:/);
    });

    test("preserves frozen Chapter 1–14 contracts; Ch11–Ch14 unchanged", () => {
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
        expect(EXECUTION_DEFINITION_CONTRACT_IDS[0]).toBe("EDC-1");
        expect(EXECUTION_DEFINITION_CONTRACT_IDS[11]).toBe("EDC-12");
        expect(getExecutionDefinitionContract("EDC-9").statement).toMatch(
            /Chapter 14 Pipeline Execution Contract/
        );
        expect(getExecutionDefinitionContract("EDC-5").statement).toMatch(
            /SHALL NOT define runtime ordering/
        );
    });
});
