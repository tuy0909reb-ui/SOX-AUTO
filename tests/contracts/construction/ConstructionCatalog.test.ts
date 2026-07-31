import * as fs from "fs";
import * as path from "path";
import {
    ConstructionCatalog,
    CONSTRUCTION_CATALOG_OUTCOME,
    CONSTRUCTION_CATALOG_PRINCIPLES,
    CONSTRUCTION_CATALOG_PRINCIPLE_IDS,
    CONSTRUCTION_CATALOG_VERIFICATION,
    ConstructionCatalogPrincipleId,
    getConstructionCatalogPrinciple,
} from "../../../src/contracts/construction/ConstructionCatalog";
import {
    CONTRACT_REGISTRY_CHAPTER_IDS,
    lookupConstructionCatalogPrinciple,
    lookupContract,
} from "../../../src/contracts/registry/ContractRegistry";
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
    id: ConstructionCatalogPrincipleId;
    title: string;
}> = [
    { id: "CCA-1", title: "Catalog Identity" },
    { id: "CCA-2", title: "Catalog Elements" },
    { id: "CCA-3", title: "Construction Definition References" },
    { id: "CCA-4", title: "Catalog Organization" },
    { id: "CCA-5", title: "Catalog Metadata" },
    { id: "CCA-6", title: "Catalog Compatibility" },
    { id: "CCA-7", title: "Catalog Scope" },
    { id: "CCA-8", title: "Catalog Integrity" },
    { id: "CCA-9", title: "Declarative Restriction" },
    { id: "CCA-10", title: "Runtime Isolation" },
    { id: "CCA-11", title: "Boundary Preservation" },
    { id: "CCA-12", title: "Future Compatibility" },
    { id: "CCA-13", title: "Catalog Ownership" },
];

describe("ASA-ARCH-21.0 / Chapter 21 — Construction Catalog", () => {
    test("CCA-1 through CCA-13 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(CONSTRUCTION_CATALOG_PRINCIPLE_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(CONSTRUCTION_CATALOG_PRINCIPLES).toHaveLength(13);
        for (const e of EXPECTED) {
            const c = getConstructionCatalogPrinciple(e.id);
            expect(c.title).toBe(e.title);
            expect(Object.isFrozen(c)).toBe(true);
            expect(lookupConstructionCatalogPrinciple(e.id).id).toBe(e.id);
        }
    });

    test("ConstructionCatalog structural type model is declarative-only", () => {
        const sample: ConstructionCatalog = Object.freeze({
            catalogId: "construction.catalog.pipeline.v1",
            elements: Object.freeze([
                Object.freeze({
                    definitionReference: Object.freeze({
                        definitionId:
                            "construction.definition.execution_graph.v1",
                    }),
                }),
                Object.freeze({
                    definitionReference: Object.freeze({
                        definitionId: "construction.definition.pipeline.v1",
                    }),
                }),
            ]),
            organization: Object.freeze({
                architecturalViewOnly: true as const,
                semanticsUndefined: true as const,
            }),
            metadata: Object.freeze({
                identifier: "construction.catalog.pipeline.v1",
                name: "Pipeline Construction Catalog",
                version: "0.5",
                ownership: "ASA-ARCH-21.0",
                compatibilityInformation: "ASA-ARCH-21.3-Ch11-Ch20",
            }),
            compatibility: Object.freeze({
                version: "0.5",
                contract: "ASA-ARCH-21.0",
                preservesDefinitionCompatibility: true as const,
                preservesRegistryCompatibility: true as const,
                preservesPriorCatalogCompatibility: true as const,
            }),
            catalogScope: Object.freeze({
                scope: "declarative-architectural-organization-only",
            }),
            integrity: Object.freeze({
                requiresReferencedDefinitionsExist: true as const,
                prohibitsDuplicateCatalogIdentities: true as const,
                requiresCatalogConsistency: true as const,
            }),
        });

        expect(sample.catalogId).toBe("construction.catalog.pipeline.v1");
        expect(sample.elements).toHaveLength(2);
        expect(
            sample.elements[0].definitionReference.definitionId
        ).toMatch(/construction\.definition/);
        expect(sample.organization.semanticsUndefined).toBe(true);
        expect(sample.metadata.name).toMatch(/Catalog/);
        expect(sample.integrity.requiresReferencedDefinitionsExist).toBe(true);
        expect(Object.keys(sample).sort()).toEqual([
            "catalogId",
            "catalogScope",
            "compatibility",
            "elements",
            "integrity",
            "metadata",
            "organization",
        ]);
        expect(sample).not.toHaveProperty("loader");
        expect(sample).not.toHaveProperty("resolver");
        expect(sample).not.toHaveProperty("runtime");
        expect(sample).not.toHaveProperty("registry");
        expect(sample).not.toHaveProperty("service");
    });

    test("CCA-2 / CCA-3 — CatalogDefinitionReference identifies definition only", () => {
        const sample: ConstructionCatalog = Object.freeze({
            catalogId: "c1",
            elements: Object.freeze([
                Object.freeze({
                    definitionReference: Object.freeze({
                        definitionId: "def-1",
                    }),
                }),
            ]),
            organization: Object.freeze({
                architecturalViewOnly: true as const,
                semanticsUndefined: true as const,
            }),
            metadata: Object.freeze({
                identifier: "c1",
                name: "ref-check",
                version: "0.5",
                ownership: "test",
                compatibilityInformation: "n/a",
            }),
            compatibility: Object.freeze({
                version: "0.5",
                contract: "ASA-ARCH-21.0",
                preservesDefinitionCompatibility: true as const,
                preservesRegistryCompatibility: true as const,
                preservesPriorCatalogCompatibility: true as const,
            }),
            catalogScope: Object.freeze({ scope: "declarative-only" }),
            integrity: Object.freeze({
                requiresReferencedDefinitionsExist: true as const,
                prohibitsDuplicateCatalogIdentities: true as const,
                requiresCatalogConsistency: true as const,
            }),
        });
        const ref = sample.elements[0].definitionReference;
        expect(Object.keys(ref)).toEqual(["definitionId"]);
        expect(ref).not.toHaveProperty("contents");
        expect(ref).not.toHaveProperty("resolved");
        expect(ref).not.toHaveProperty("path");
        expect(ref).not.toHaveProperty("loader");
    });

    test("CCA-4 — organization carries no runtime or priority semantics", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(/semantics are intentionally undefined/);
        expect(getConstructionCatalogPrinciple("CCA-4").statement).toMatch(
            /execution order|dependency relationships|scheduling priority/i
        );
        expect(getConstructionCatalogPrinciple("CCA-4").statement).toMatch(
            /intentionally undefined/
        );
    });

    test("CCA-8 / CCA-9 / CCA-10 — integrity declarative; no runtime / executable logic", () => {
        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative Construction Catalog type model and CCA registry only/
        );
        expect(body).toMatch(
            /Declares integrity requirements only — no verification/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(register|unregister|resolve|load|lookupDefinition|discover|compose|expand|validate|schedule|optimize|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate|planConstruction)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CatalogService|CatalogLoader|CatalogResolver|RegistryService|RegistryLoader|Builder|Factory|Compiler|Generator|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect([...CONSTRUCTION_CATALOG_VERIFICATION]).toEqual(
            expect.arrayContaining([
                "Registration",
                "Lookup",
                "Resolution",
                "Discovery",
                "Loading",
                "Construction execution",
            ])
        );
        expect(CONSTRUCTION_CATALOG_OUTCOME.exclusion).toMatch(
            /No registration behavior, lookup behavior/
        );
    });

    test("CCA-11 / CCA-13 — boundary and ownership preservation; Ch19–Ch20 unchanged", () => {
        expect(fs.existsSync(CH19_SRC)).toBe(true);
        expect(fs.existsSync(CH20_SRC)).toBe(true);
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
        expect(getConstructionCatalogPrinciple("CCA-11").statement).toMatch(
            /not a presentation or alternative representation of Construction Registry/
        );
        expect(getConstructionCatalogPrinciple("CCA-13").statement).toMatch(
            /Chapter 19/
        );
        expect(getConstructionCatalogPrinciple("CCA-13").statement).toMatch(
            /Chapter 20/
        );
        expect(CONSTRUCTION_CATALOG_OUTCOME.ownership).toMatch(/Chapter 19/);
        expect(CONSTRUCTION_CATALOG_OUTCOME.ownership).toMatch(/Chapter 20/);
    });

    test("CCA-12 — future compatibility without defining future responsibilities", () => {
        expect(getConstructionCatalogPrinciple("CCA-12").statement).toMatch(
            /without defining their responsibilities/
        );
    });

    test("ContractRegistry registers Chapter 21 with principle-catalog access only", () => {
        expect(CONTRACT_REGISTRY_CHAPTER_IDS).toContain("ASA-ARCH-21.3-CH21");
        const ch21 = lookupContract("ASA-ARCH-21.3-CH21");
        expect(ch21.contractName).toBe("Construction Catalog");
        expect(ch21.coverage).toEqual(CONSTRUCTION_CATALOG_PRINCIPLE_IDS);
        expect(Object.isFrozen(ch21)).toBe(true);
    });

    test("immutability — principle registry and sample catalog are frozen", () => {
        expect(Object.isFrozen(CONSTRUCTION_CATALOG_PRINCIPLES)).toBe(true);
        expect(Object.isFrozen(CONSTRUCTION_CATALOG_PRINCIPLE_IDS)).toBe(true);
        expect(() => {
            (CONSTRUCTION_CATALOG_PRINCIPLES as unknown as Array<unknown>).push(
                {}
            );
        }).toThrow();
    });
});
