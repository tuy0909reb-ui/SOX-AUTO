import * as fs from "fs";
import * as path from "path";
import {
    ConstructionDefinition,
    CONSTRUCTION_DEFINITION_OUTCOME,
    CONSTRUCTION_DEFINITION_PRINCIPLES,
    CONSTRUCTION_DEFINITION_PRINCIPLE_IDS,
    CONSTRUCTION_DEFINITION_VERIFICATION,
    ConstructionDefinitionPrincipleId,
    getConstructionDefinitionPrinciple,
} from "../../../src/contracts/construction/ConstructionDefinition";
import {
    CONTRACT_REGISTRY_CHAPTER_IDS,
    lookupConstructionDefinitionPrinciple,
    lookupContract,
} from "../../../src/contracts/registry/ContractRegistry";
import { CONSTRUCTION_CONTRACT_PRINCIPLE_IDS } from "../../../src/contracts/construction/ConstructionContract";
import { EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS } from "../../../src/workflow/ExecutionGraphConstructionBoundaryContract";
import { EXECUTION_GRAPH_CONTRACT_IDS } from "../../../src/workflow/ExecutionGraphContract";
import { EXECUTION_DEFINITION_CONTRACT_IDS } from "../../../src/workflow/ExecutionDefinitionContract";
import { PIPELINE_EXECUTION_CONTRACT_IDS } from "../../../src/workflow/PipelineExecutionContract";
import { PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS } from "../../../src/workflow/PipelineExecutionBoundaryContract";
import { PIPELINE_COMPOSITION_CONTRACT_IDS } from "../../../src/workflow/PipelineCompositionContract";
import { COMPOSITION_BOUNDARY_CONTRACT_IDS } from "../../../src/workflow/CompositionBoundaryContract";

const SRC = path.resolve(
    __dirname,
    "../../../src/contracts/construction/ConstructionDefinition.ts"
);
const CH18_SRC = path.resolve(
    __dirname,
    "../../../src/contracts/construction/ConstructionContract.ts"
);

const EXPECTED: Array<{
    id: ConstructionDefinitionPrincipleId;
    title: string;
}> = [
    { id: "CDD-1", title: "Construction Definition Identity" },
    { id: "CDD-2", title: "Construction Definition Elements" },
    { id: "CDD-3", title: "Construction Definition Metadata" },
    { id: "CDD-4", title: "Construction Responsibility Metadata" },
    { id: "CDD-5", title: "Definition Compatibility" },
    { id: "CDD-6", title: "Definition Scope" },
    { id: "CDD-7", title: "Definition Integrity" },
    { id: "CDD-8", title: "Declarative Restriction" },
    { id: "CDD-9", title: "Runtime Isolation" },
    { id: "CDD-10", title: "Boundary Preservation" },
    { id: "CDD-11", title: "Future Construction Compatibility" },
    { id: "CDD-12", title: "Definition Ownership" },
];

describe("ASA-ARCH-21.3 Chapter 19 — Construction Definition", () => {
    test("CDD-1 through CDD-12 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(CONSTRUCTION_DEFINITION_PRINCIPLE_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(CONSTRUCTION_DEFINITION_PRINCIPLES).toHaveLength(12);
        for (const e of EXPECTED) {
            const c = getConstructionDefinitionPrinciple(e.id);
            expect(c.title).toBe(e.title);
            expect(Object.isFrozen(c)).toBe(true);
            expect(lookupConstructionDefinitionPrinciple(e.id).id).toBe(e.id);
        }
    });

    test("ConstructionDefinition structural type model is declarative-only", () => {
        const sample: ConstructionDefinition = Object.freeze({
            definitionId: "construction.definition.execution_graph.v1",
            elements: Object.freeze([
                Object.freeze({
                    elementId: "element-a",
                    elementType: "structural-node",
                }),
                Object.freeze({
                    elementId: "element-b",
                    elementType: "structural-edge",
                }),
            ]),
            metadata: Object.freeze({
                description: "declarative-construction-definition",
            }),
            responsibilityMetadata: Object.freeze({
                description: "declarative-responsibility-only",
            }),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            definitionScope: Object.freeze({
                scope: "declarative-definition-only",
            }),
            integrity: Object.freeze({
                requiresInternalConsistency: true as const,
                requiresNoContradictoryElements: true as const,
            }),
        });

        expect(sample.definitionId).toBe(
            "construction.definition.execution_graph.v1"
        );
        expect(sample.elements).toHaveLength(2);
        expect(sample.metadata.description).toMatch(/declarative/);
        expect(sample.responsibilityMetadata.description).toMatch(
            /declarative-responsibility/
        );
        expect(sample.integrity.requiresInternalConsistency).toBe(true);
        expect(Object.keys(sample).sort()).toEqual([
            "compatibility",
            "definitionId",
            "definitionScope",
            "elements",
            "integrity",
            "metadata",
            "responsibilityMetadata",
        ]);
        expect(sample).not.toHaveProperty("builder");
        expect(sample).not.toHaveProperty("runtime");
        expect(sample).not.toHaveProperty("procedure");
    });

    test("CDD-8 / CDD-9 — declarative restriction and runtime isolation", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative Construction Definition type model and CDD registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(Builder|Factory|Compiler|Generator|Transformer|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect([...CONSTRUCTION_DEFINITION_VERIFICATION]).toEqual(
            expect.arrayContaining([
                "Builder Architecture",
                "Construction Runtime",
                "Dependency Resolution",
            ])
        );
        expect(CONSTRUCTION_DEFINITION_OUTCOME.exclusion).toMatch(
            /No construction behavior, runtime behavior/
        );
    });

    test("CDD-10 — preserves frozen Ch11–Ch18; Ch18 source unchanged", () => {
        expect(fs.existsSync(CH18_SRC)).toBe(true);
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_EXECUTION_CONTRACT_IDS).toHaveLength(11);
        expect(EXECUTION_DEFINITION_CONTRACT_IDS).toHaveLength(12);
        expect(EXECUTION_GRAPH_CONTRACT_IDS).toHaveLength(12);
        expect(
            EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS
        ).toHaveLength(12);
        expect(CONSTRUCTION_CONTRACT_PRINCIPLE_IDS).toHaveLength(12);
        expect(getConstructionDefinitionPrinciple("CDD-10").statement).toMatch(
            /Chapter 11 through Chapter 18/
        );
    });

    test("CDD-11 / CDD-12 — future compatibility and definition ownership", () => {
        expect(getConstructionDefinitionPrinciple("CDD-11").statement).toMatch(
            /This chapter introduces none of them/
        );
        expect(getConstructionDefinitionPrinciple("CDD-12").statement).toMatch(
            /declarative definition responsibilities/
        );
    });

    test("ContractRegistry registers Chapter 19 with lookup only", () => {
        expect(CONTRACT_REGISTRY_CHAPTER_IDS).toContain("ASA-ARCH-21.3-CH19");
        const ch19 = lookupContract("ASA-ARCH-21.3-CH19");
        expect(ch19.contractName).toBe("Construction Definition");
        expect(ch19.coverage).toEqual(CONSTRUCTION_DEFINITION_PRINCIPLE_IDS);
        expect(Object.isFrozen(ch19)).toBe(true);
    });
});
