import * as fs from "fs";
import * as path from "path";
import {
    ConstructionRegistry,
    CONSTRUCTION_REGISTRY_OUTCOME,
    CONSTRUCTION_REGISTRY_PRINCIPLES,
    CONSTRUCTION_REGISTRY_PRINCIPLE_IDS,
    CONSTRUCTION_REGISTRY_VERIFICATION,
    ConstructionRegistryPrincipleId,
    getConstructionRegistryPrinciple,
} from "../../../src/contracts/construction/ConstructionRegistry";
import {
    CONTRACT_REGISTRY_CHAPTER_IDS,
    lookupConstructionRegistryPrinciple,
    lookupContract,
} from "../../../src/contracts/registry/ContractRegistry";
import { CONSTRUCTION_DEFINITION_PRINCIPLE_IDS } from "../../../src/contracts/construction/ConstructionDefinition";
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
    "../../../src/contracts/construction/ConstructionRegistry.ts"
);
const CH19_SRC = path.resolve(
    __dirname,
    "../../../src/contracts/construction/ConstructionDefinition.ts"
);

const EXPECTED: Array<{
    id: ConstructionRegistryPrincipleId;
    title: string;
}> = [
    { id: "CRG-1", title: "Construction Registry Identity" },
    { id: "CRG-2", title: "Registry Entries" },
    { id: "CRG-3", title: "Construction Definition References" },
    { id: "CRG-4", title: "Construction Registry Metadata" },
    { id: "CRG-5", title: "Registry Compatibility" },
    { id: "CRG-6", title: "Registry Scope" },
    { id: "CRG-7", title: "Registry Integrity" },
    { id: "CRG-8", title: "Declarative Restriction" },
    { id: "CRG-9", title: "Runtime Isolation" },
    { id: "CRG-10", title: "Boundary Preservation" },
    { id: "CRG-11", title: "Future Registry Compatibility" },
    { id: "CRG-12", title: "Registry Ownership" },
];

describe("ASA-ARCH-21.3 Chapter 20 — Construction Registry", () => {
    test("CRG-1 through CRG-12 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(CONSTRUCTION_REGISTRY_PRINCIPLE_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(CONSTRUCTION_REGISTRY_PRINCIPLES).toHaveLength(12);
        for (const e of EXPECTED) {
            const c = getConstructionRegistryPrinciple(e.id);
            expect(c.title).toBe(e.title);
            expect(Object.isFrozen(c)).toBe(true);
            expect(lookupConstructionRegistryPrinciple(e.id).id).toBe(e.id);
        }
    });

    test("ConstructionRegistry structural type model is declarative-only", () => {
        const sample: ConstructionRegistry = Object.freeze({
            registryId: "construction.registry.execution_graph.v1",
            entries: Object.freeze([
                Object.freeze({
                    entryId: "entry-a",
                    definitionReferences: Object.freeze([
                        Object.freeze({
                            definitionId:
                                "construction.definition.execution_graph.v1",
                        }),
                    ]),
                }),
                Object.freeze({
                    entryId: "entry-b",
                    definitionReferences: Object.freeze([
                        Object.freeze({
                            definitionId:
                                "construction.definition.pipeline.v1",
                        }),
                        Object.freeze({
                            definitionId:
                                "construction.definition.boundary.v1",
                        }),
                    ]),
                }),
            ]),
            metadata: Object.freeze({
                description: "declarative-construction-registry",
            }),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            registryScope: Object.freeze({
                scope: "declarative-registration-structure-only",
            }),
            integrity: Object.freeze({
                requiresInternalConsistency: true as const,
                requiresNoContradictoryEntries: true as const,
            }),
        });

        expect(sample.registryId).toBe(
            "construction.registry.execution_graph.v1"
        );
        expect(sample.entries).toHaveLength(2);
        expect(sample.entries[0].definitionReferences[0].definitionId).toMatch(
            /construction\.definition/
        );
        expect(sample.metadata.description).toMatch(/declarative/);
        expect(sample.integrity.requiresInternalConsistency).toBe(true);
        expect(Object.keys(sample).sort()).toEqual([
            "compatibility",
            "entries",
            "integrity",
            "metadata",
            "registryId",
            "registryScope",
        ]);
        expect(sample).not.toHaveProperty("loader");
        expect(sample).not.toHaveProperty("resolver");
        expect(sample).not.toHaveProperty("runtime");
        expect(sample).not.toHaveProperty("service");
    });

    test("CRG-3 — ConstructionDefinitionReference identifies definition only", () => {
        const sample: ConstructionRegistry = Object.freeze({
            registryId: "r1",
            entries: Object.freeze([
                Object.freeze({
                    entryId: "e1",
                    definitionReferences: Object.freeze([
                        Object.freeze({ definitionId: "def-1" }),
                    ]),
                }),
            ]),
            metadata: Object.freeze({ description: "ref-check" }),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            registryScope: Object.freeze({ scope: "declarative-only" }),
            integrity: Object.freeze({
                requiresInternalConsistency: true as const,
                requiresNoContradictoryEntries: true as const,
            }),
        });
        const ref = sample.entries[0].definitionReferences[0];
        expect(Object.keys(ref)).toEqual(["definitionId"]);
        expect(ref).not.toHaveProperty("resolved");
        expect(ref).not.toHaveProperty("path");
        expect(ref).not.toHaveProperty("loader");
    });

    test("CRG-8 / CRG-9 — declarative restriction and runtime isolation", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative Construction Registry type model and CRG registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(register|unregister|resolve|load|lookupDefinition|compose|expand|validate|schedule|optimize|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(RegistryService|RegistryLoader|RegistryResolver|Builder|Factory|Compiler|Generator|Transformer|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect([...CONSTRUCTION_REGISTRY_VERIFICATION]).toEqual(
            expect.arrayContaining([
                "Registry Services",
                "Lookup Logic",
                "Resolution Logic",
                "Loading Logic",
            ])
        );
        expect(CONSTRUCTION_REGISTRY_OUTCOME.exclusion).toMatch(
            /No registration behavior, construction behavior, runtime behavior/
        );
    });

    test("CRG-10 — preserves frozen Ch11–Ch19; Ch19 source unchanged", () => {
        expect(fs.existsSync(CH19_SRC)).toBe(true);
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
        expect(CONSTRUCTION_DEFINITION_PRINCIPLE_IDS).toHaveLength(12);
        expect(getConstructionRegistryPrinciple("CRG-10").statement).toMatch(
            /Chapter 11 through Chapter 19/
        );
    });

    test("CRG-11 / CRG-12 — future compatibility and registry ownership", () => {
        expect(getConstructionRegistryPrinciple("CRG-11").statement).toMatch(
            /This chapter introduces none of them/
        );
        expect(getConstructionRegistryPrinciple("CRG-12").statement).toMatch(
            /declarative registration responsibilities/
        );
    });

    test("ContractRegistry registers Chapter 20 with principle-catalog access only", () => {
        expect(CONTRACT_REGISTRY_CHAPTER_IDS).toContain("ASA-ARCH-21.3-CH20");
        const ch20 = lookupContract("ASA-ARCH-21.3-CH20");
        expect(ch20.contractName).toBe("Construction Registry");
        expect(ch20.coverage).toEqual(CONSTRUCTION_REGISTRY_PRINCIPLE_IDS);
        expect(Object.isFrozen(ch20)).toBe(true);
    });
});
