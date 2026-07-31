import * as fs from "fs";
import * as path from "path";
import {
    ConstructionContract,
    CONSTRUCTION_CONTRACT_OUTCOME,
    CONSTRUCTION_CONTRACT_PRINCIPLES,
    CONSTRUCTION_CONTRACT_PRINCIPLE_IDS,
    CONSTRUCTION_CONTRACT_VERIFICATION,
    ConstructionContractPrincipleId,
    getConstructionContractPrinciple,
} from "../../../src/contracts/construction/ConstructionContract";
import {
    CONTRACT_REGISTRY,
    CONTRACT_REGISTRY_CHAPTER_IDS,
    lookupConstructionContractPrinciple,
    lookupContract,
} from "../../../src/contracts/registry/ContractRegistry";
import { EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS } from "../../../src/workflow/ExecutionGraphConstructionBoundaryContract";
import { EXECUTION_GRAPH_CONTRACT_IDS } from "../../../src/workflow/ExecutionGraphContract";
import { EXECUTION_DEFINITION_CONTRACT_IDS } from "../../../src/workflow/ExecutionDefinitionContract";
import { PIPELINE_EXECUTION_CONTRACT_IDS } from "../../../src/workflow/PipelineExecutionContract";
import { PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS } from "../../../src/workflow/PipelineExecutionBoundaryContract";
import { PIPELINE_COMPOSITION_CONTRACT_IDS } from "../../../src/workflow/PipelineCompositionContract";
import { COMPOSITION_BOUNDARY_CONTRACT_IDS } from "../../../src/workflow/CompositionBoundaryContract";

const SRC = path.resolve(
    __dirname,
    "../../../src/contracts/construction/ConstructionContract.ts"
);
const REGISTRY_SRC = path.resolve(
    __dirname,
    "../../../src/contracts/registry/ContractRegistry.ts"
);

const EXPECTED: Array<{
    id: ConstructionContractPrincipleId;
    title: string;
}> = [
    { id: "CCC-1", title: "Contract Identity" },
    { id: "CCC-2", title: "Input Contract" },
    { id: "CCC-3", title: "Output Contract" },
    { id: "CCC-4", title: "Construction Metadata" },
    { id: "CCC-5", title: "Construction Responsibility Metadata" },
    { id: "CCC-6", title: "Compatibility" },
    { id: "CCC-7", title: "Construction Scope" },
    { id: "CCC-8", title: "Declarative Restriction" },
    { id: "CCC-9", title: "Runtime Isolation" },
    { id: "CCC-10", title: "Boundary Preservation" },
    { id: "CCC-11", title: "Future Construction Compatibility" },
    { id: "CCC-12", title: "Contract Scope" },
];

describe("ASA-ARCH-21.3 Chapter 18 — Construction Contract", () => {
    test("CCC-1 through CCC-12 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(REGISTRY_SRC)).toBe(true);
        expect(CONSTRUCTION_CONTRACT_PRINCIPLE_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(CONSTRUCTION_CONTRACT_PRINCIPLES).toHaveLength(12);
        for (const e of EXPECTED) {
            const c = getConstructionContractPrinciple(e.id);
            expect(c.title).toBe(e.title);
            expect(Object.isFrozen(c)).toBe(true);
            expect(lookupConstructionContractPrinciple(e.id).id).toBe(e.id);
        }
    });

    test("ConstructionContract structural type model is declarative-only (CCC-1〜CCC-7)", () => {
        const sample: ConstructionContract = Object.freeze({
            contractId: "construction.contract.execution_graph.v1",
            inputContract: Object.freeze({
                contractType: "ExecutionGraphContract",
            }),
            outputContract: Object.freeze({
                contractType: "ConstructionDefinition",
            }),
            constructionMetadata: Object.freeze({
                description: "declarative-construction-contract",
            }),
            constructionResponsibilityMetadata: Object.freeze({
                associatedBoundary:
                    "ASA-ARCH-21.3-CH17-ExecutionGraphConstructionBoundary",
                responsibilityMetadata:
                    "associated-with-ch17-responsibility-transition",
            }),
            compatibility: Object.freeze({
                version: "1.0",
                contract: "ASA-ARCH-21.3",
            }),
            constructionScope: Object.freeze({
                scope: "declarative-contract-only",
            }),
        });

        // CCC-1
        expect(sample.contractId).toBe(
            "construction.contract.execution_graph.v1"
        );
        // CCC-2 / CCC-3
        expect(sample.inputContract.contractType).toBe("ExecutionGraphContract");
        expect(sample.outputContract.contractType).toBe(
            "ConstructionDefinition"
        );
        // CCC-4 — structural description only; no config/options/behavior keys
        expect(Object.keys(sample.constructionMetadata)).toEqual([
            "description",
        ]);
        expect(sample.constructionMetadata).not.toHaveProperty("configuration");
        expect(sample.constructionMetadata).not.toHaveProperty("options");
        expect(sample.constructionMetadata).not.toHaveProperty("runtime");
        // CCC-5 — references Ch17; does not redefine boundary
        expect(
            sample.constructionResponsibilityMetadata.associatedBoundary
        ).toMatch(/CH17/);
        expect(
            sample.constructionResponsibilityMetadata
        ).not.toHaveProperty("responsibilityBoundary");
        expect(
            sample.constructionResponsibilityMetadata
        ).not.toHaveProperty("implementation");
        // CCC-6
        expect(sample.compatibility.contract).toBe("ASA-ARCH-21.3");
        // CCC-7
        expect(sample.constructionScope.scope).toBe("declarative-contract-only");

        expect(Object.keys(sample).sort()).toEqual([
            "compatibility",
            "constructionMetadata",
            "constructionResponsibilityMetadata",
            "constructionScope",
            "contractId",
            "inputContract",
            "outputContract",
        ]);
    });

    test("CCC-8 / CCC-9 — no executable members; runtime isolation", () => {
        const body = fs.readFileSync(SRC, "utf8");
        const registryBody = fs.readFileSync(REGISTRY_SRC, "utf8");
        expect(body).toMatch(
            /Declarative Construction Contract type model and CCC registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindRuntime|buildExecutionGraph|constructGraph|createBuilder|createFactory|transform|compile|generate)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(Builder|Factory|Compiler|Generator|Transformer|Scheduler|Dispatcher|RuntimeGraph)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect(registryBody).toMatch(/declarative lookup only/);
        expect(registryBody).not.toMatch(
            /\bfunction\s+(instantiate|execute|validate|transform|construct)\b/
        );
        expect([...CONSTRUCTION_CONTRACT_VERIFICATION]).toEqual(
            expect.arrayContaining([
                "Builder implementations",
                "Factory implementations",
                "Runtime execution",
            ])
        );
        expect(CONSTRUCTION_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
    });

    test("CCC-10 — preserves frozen Ch11–Ch17 contracts", () => {
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_EXECUTION_CONTRACT_IDS).toHaveLength(11);
        expect(EXECUTION_DEFINITION_CONTRACT_IDS).toHaveLength(12);
        expect(EXECUTION_GRAPH_CONTRACT_IDS).toHaveLength(12);
        expect(
            EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS
        ).toHaveLength(12);
        expect(getConstructionContractPrinciple("CCC-10").statement).toMatch(
            /Chapter 11 through Chapter 17/
        );
    });

    test("CCC-11 / CCC-12 — forward compatibility and declarative scope", () => {
        expect(getConstructionContractPrinciple("CCC-11").statement).toMatch(
            /future Construction Definition/
        );
        expect(getConstructionContractPrinciple("CCC-12").statement).toMatch(
            /declarative contract scope only/
        );
    });

    test("ContractRegistry provides lookup only for Ch18 and prior chapters", () => {
        expect(CONTRACT_REGISTRY_CHAPTER_IDS).toContain("ASA-ARCH-21.3-CH18");
        expect(CONTRACT_REGISTRY.length).toBeGreaterThanOrEqual(8);
        const ch18 = lookupContract("ASA-ARCH-21.3-CH18");
        expect(ch18.contractName).toBe("Construction Contract");
        expect(ch18.coverage).toEqual(CONSTRUCTION_CONTRACT_PRINCIPLE_IDS);
        expect(Object.isFrozen(ch18)).toBe(true);
        expect(() => {
            (CONTRACT_REGISTRY as unknown as Array<unknown>).push({});
        }).toThrow();
    });
});
