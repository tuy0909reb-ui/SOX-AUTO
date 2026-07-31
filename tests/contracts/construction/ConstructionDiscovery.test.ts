import * as fs from "fs";
import * as path from "path";
import {
    ConstructionDiscovery,
    CONSTRUCTION_DISCOVERY_OUTCOME,
    CONSTRUCTION_DISCOVERY_PRINCIPLES,
    CONSTRUCTION_DISCOVERY_PRINCIPLE_IDS,
    CONSTRUCTION_DISCOVERY_VERIFICATION,
    ConstructionDiscoveryPrincipleId,
    getConstructionDiscoveryPrinciple,
} from "../../../src/contracts/construction/ConstructionDiscovery";
import {
    CONTRACT_REGISTRY_CHAPTER_IDS,
    lookupConstructionDiscoveryPrinciple,
    lookupContract,
} from "../../../src/contracts/registry/ContractRegistry";
import { CONSTRUCTION_CATALOG_PRINCIPLE_IDS } from "../../../src/contracts/construction/ConstructionCatalog";
import { CONSTRUCTION_REGISTRY_PRINCIPLE_IDS } from "../../../src/contracts/construction/ConstructionRegistry";
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
    "../../../src/contracts/construction/ConstructionDiscovery.ts"
);
const CH21_SRC = path.resolve(
    __dirname,
    "../../../src/contracts/construction/ConstructionCatalog.ts"
);
const CH20_SRC = path.resolve(
    __dirname,
    "../../../src/contracts/construction/ConstructionRegistry.ts"
);
const CH19_SRC = path.resolve(
    __dirname,
    "../../../src/contracts/construction/ConstructionDefinition.ts"
);

const EXPECTED: Array<{
    id: ConstructionDiscoveryPrincipleId;
    title: string;
}> = [
    { id: "CDD-1", title: "Discovery Identity" },
    { id: "CDD-2", title: "Discovery Elements" },
    { id: "CDD-3", title: "Construction Catalog References" },
    { id: "CDD-4", title: "Discovery Metadata" },
    { id: "CDD-5", title: "Discovery Compatibility" },
    { id: "CDD-6", title: "Discovery Scope" },
    { id: "CDD-7", title: "Discovery Integrity" },
    { id: "CDD-8", title: "Declarative Restriction" },
    { id: "CDD-9", title: "Runtime Isolation" },
    { id: "CDD-10", title: "Boundary Preservation" },
    { id: "CDD-11", title: "Future Compatibility" },
    { id: "CDD-12", title: "Discovery Ownership" },
];

describe("ASA-ARCH-22.0 / Chapter 22 — Construction Discovery", () => {
    test("CDD-1 through CDD-12 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(CONSTRUCTION_DISCOVERY_PRINCIPLE_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(CONSTRUCTION_DISCOVERY_PRINCIPLES).toHaveLength(12);
        for (const e of EXPECTED) {
            const c = getConstructionDiscoveryPrinciple(e.id);
            expect(c.title).toBe(e.title);
            expect(Object.isFrozen(c)).toBe(true);
            expect(lookupConstructionDiscoveryPrinciple(e.id).id).toBe(e.id);
        }
    });

    test("ConstructionDiscovery structural type model is declarative-only", () => {
        const sample: ConstructionDiscovery = Object.freeze({
            discoveryId: "construction.discovery.catalog.v1",
            elements: Object.freeze([
                Object.freeze({
                    catalogReference: Object.freeze({
                        catalogId: "construction.catalog.pipeline.v1",
                    }),
                }),
            ]),
            metadata: Object.freeze({
                identifier: "construction.discovery.catalog.v1",
                name: "Catalog Construction Discovery",
                version: "0.7",
                ownership: "ASA-ARCH-22.0",
                compatibilityInformation: "ASA-ARCH-21.3-Ch11-Ch21",
            }),
            compatibility: Object.freeze({
                version: "0.7",
                contract: "ASA-ARCH-22.0",
                preservesFrozenContractCompatibility: true as const,
                preservesPriorDiscoveryCompatibility: true as const,
                preservesCatalogReferenceValidity: true as const,
            }),
            discoveryScope: Object.freeze({
                scope: "declarative-discovery-responsibility-only",
            }),
            integrity: Object.freeze({
                requiresValidDiscoveryIdentity: true as const,
                requiresValidCatalogReferences: true as const,
                requiresDiscoveryConsistency: true as const,
            }),
        });

        expect(sample.discoveryId).toBe("construction.discovery.catalog.v1");
        expect(sample.elements).toHaveLength(1);
        expect(sample.elements[0].catalogReference.catalogId).toMatch(
            /construction\.catalog/
        );
        expect(sample.metadata.name).toMatch(/Discovery/);
        expect(sample.integrity.requiresValidCatalogReferences).toBe(true);
        expect(Object.keys(sample).sort()).toEqual([
            "compatibility",
            "discoveryId",
            "discoveryScope",
            "elements",
            "integrity",
            "metadata",
        ]);
        expect(sample).not.toHaveProperty("loader");
        expect(sample).not.toHaveProperty("resolver");
        expect(sample).not.toHaveProperty("runtime");
        expect(sample).not.toHaveProperty("service");
        expect(sample).not.toHaveProperty("implementation");
    });

    test("CDD-2 / CDD-3 — DiscoveryCatalogReference identifies catalog only", () => {
        const sample: ConstructionDiscovery = Object.freeze({
            discoveryId: "d1",
            elements: Object.freeze([
                Object.freeze({
                    catalogReference: Object.freeze({
                        catalogId: "catalog-1",
                    }),
                }),
            ]),
            metadata: Object.freeze({
                identifier: "d1",
                name: "ref-check",
                version: "0.7",
                ownership: "test",
                compatibilityInformation: "n/a",
            }),
            compatibility: Object.freeze({
                version: "0.7",
                contract: "ASA-ARCH-22.0",
                preservesFrozenContractCompatibility: true as const,
                preservesPriorDiscoveryCompatibility: true as const,
                preservesCatalogReferenceValidity: true as const,
            }),
            discoveryScope: Object.freeze({ scope: "declarative-only" }),
            integrity: Object.freeze({
                requiresValidDiscoveryIdentity: true as const,
                requiresValidCatalogReferences: true as const,
                requiresDiscoveryConsistency: true as const,
            }),
        });
        const ref = sample.elements[0].catalogReference;
        expect(Object.keys(ref)).toEqual(["catalogId"]);
        expect(ref).not.toHaveProperty("contents");
        expect(ref).not.toHaveProperty("resolved");
        expect(ref).not.toHaveProperty("path");
        expect(ref).not.toHaveProperty("loader");
        expect(CONSTRUCTION_DISCOVERY_OUTCOME.soleInput).toMatch(
            /Construction Catalog is the sole/
        );
    });

    test("CDD-8 / CDD-9 — declarative restriction and runtime isolation", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative Construction Discovery type model and CDD registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(register|unregister|resolve|load|lookupDefinition|discover|discoverCatalog|compose|expand|validate|schedule|optimize|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate|planConstruction)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(DiscoveryService|DiscoveryLoader|DiscoveryResolver|CatalogService|CatalogLoader|RegistryService|Builder|Factory|Compiler|Generator|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect([...CONSTRUCTION_DISCOVERY_VERIFICATION]).toEqual(
            expect.arrayContaining([
                "Lookup",
                "Resolution",
                "Discovery implementation",
                "Loading",
                "Construction execution",
            ])
        );
        expect(CONSTRUCTION_DISCOVERY_OUTCOME.exclusion).toMatch(
            /No executable discovery behavior/
        );
    });

    test("CDD-10 / CDD-12 — boundary and ownership; Ch19–Ch21 unchanged", () => {
        expect(fs.existsSync(CH19_SRC)).toBe(true);
        expect(fs.existsSync(CH20_SRC)).toBe(true);
        expect(fs.existsSync(CH21_SRC)).toBe(true);
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
        expect(CONSTRUCTION_REGISTRY_PRINCIPLE_IDS).toHaveLength(12);
        expect(CONSTRUCTION_CATALOG_PRINCIPLE_IDS).toHaveLength(13);
        expect(getConstructionDiscoveryPrinciple("CDD-10").statement).toMatch(
            /shall not absorb Registry or Catalog responsibilities/
        );
        expect(getConstructionDiscoveryPrinciple("CDD-12").statement).toMatch(
            /Chapter 21/
        );
        expect(CONSTRUCTION_DISCOVERY_OUTCOME.ownership).toMatch(/Chapter 21/);
    });

    test("CDD-11 — future compatibility without defining future responsibilities", () => {
        expect(getConstructionDiscoveryPrinciple("CDD-11").statement).toMatch(
            /without defining their responsibilities/
        );
        expect(getConstructionDiscoveryPrinciple("CDD-11").statement).toMatch(
            /separate frozen architectural contracts/
        );
    });

    test("ContractRegistry registers Chapter 22 with principle-catalog access only", () => {
        expect(CONTRACT_REGISTRY_CHAPTER_IDS).toContain("ASA-ARCH-21.3-CH22");
        const ch22 = lookupContract("ASA-ARCH-21.3-CH22");
        expect(ch22.contractName).toBe("Construction Discovery");
        expect(ch22.coverage).toEqual(CONSTRUCTION_DISCOVERY_PRINCIPLE_IDS);
        expect(Object.isFrozen(ch22)).toBe(true);
    });

    test("immutability — principle registry is frozen", () => {
        expect(Object.isFrozen(CONSTRUCTION_DISCOVERY_PRINCIPLES)).toBe(true);
        expect(Object.isFrozen(CONSTRUCTION_DISCOVERY_PRINCIPLE_IDS)).toBe(true);
        expect(() => {
            (
                CONSTRUCTION_DISCOVERY_PRINCIPLES as unknown as Array<unknown>
            ).push({});
        }).toThrow();
    });

    test("Chapter 22 CDD IDs are distinct TypeScript registry from Chapter 19 CDD", () => {
        const discovery = getConstructionDiscoveryPrinciple("CDD-1");
        expect(discovery.title).toBe("Discovery Identity");
        expect(discovery.statement).toMatch(/Construction Discovery/);
        expect(discovery.statement).not.toMatch(
            /Construction Definition shall possess/
        );
    });
});
