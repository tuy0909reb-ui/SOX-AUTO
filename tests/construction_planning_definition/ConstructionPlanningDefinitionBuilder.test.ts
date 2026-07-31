import * as fs from "fs";
import * as path from "path";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinition } from "../../src/construction_planning_definition/ConstructionPlanningDefinition";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import type { ConstructionPlanningDefinitionMetadata } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionTypes";

const PLAN_META = Object.freeze({
    identifier: "plan-for-def-builder",
    name: "Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "contract-for-def-builder",
    name: "Contract",
    version: "0.4",
});

const META: ConstructionPlanningDefinitionMetadata = Object.freeze({
    identifier: "cpd-builder",
    name: "Builder Test Definition",
    version: "0.5",
});

function sampleContract() {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("plan-ok")
        .withMetadata(PLAN_META)
        .addReference(Object.freeze({ definitionReferenceId: "def-1" }))
        .build();

    return new ConstructionPlanningContractBuilder()
        .withContractId("cpc-ok")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .build();
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_planning_definition"
);

describe("ASA-ARCH-27.0 — ConstructionPlanningDefinitionBuilder", () => {
    test("builder constructs immutable instances with structural validation only", () => {
        const contract = sampleContract();
        const definition = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("cpd-ok")
            .withMetadata(META)
            .withConstructionPlanningContract(contract)
            .build();

        expect(definition).toBeInstanceOf(ConstructionPlanningDefinition);
        expect(Object.isFrozen(definition)).toBe(true);
        expect(definition.contents.constructionPlanningContract).toBe(contract);
    });

    test("structural validation rejects missing definitionId", () => {
        expect(() =>
            new ConstructionPlanningDefinitionBuilder()
                .withMetadata(META)
                .withConstructionPlanningContract(sampleContract())
                .build()
        ).toThrow(/definitionId is required/);
    });

    test("structural validation rejects missing metadata", () => {
        expect(() =>
            new ConstructionPlanningDefinitionBuilder()
                .withDefinitionId("cpd-1")
                .withConstructionPlanningContract(sampleContract())
                .build()
        ).toThrow(/metadata is required/);
    });

    test("structural validation rejects missing constructionPlanningContract", () => {
        expect(() =>
            new ConstructionPlanningDefinitionBuilder()
                .withDefinitionId("cpd-1")
                .withMetadata(META)
                .build()
        ).toThrow(/constructionPlanningContract is required/);
    });

    test("withContents preserves ConstructionPlanningContract by reference", () => {
        const contract = sampleContract();
        const definition = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("cpd-contents")
            .withMetadata(META)
            .withContents({ constructionPlanningContract: contract })
            .build();

        expect(definition.contents.constructionPlanningContract).toBe(contract);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionPlanningDefinition.ts",
            "ConstructionPlanningDefinitionBuilder.ts",
            "ConstructionPlanningDefinitionTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /\bfunction\s+(select|discover|resolve|load|lookup|bind|schedule|analyzeDependencies|planConstruction|optimize|traverse)\b/
            );
            expect(body).not.toMatch(
                /\bclass\s+(SelectionService|DiscoveryService|RegistryService|Planner|Scheduler|Dispatcher)\b/
            );
            expect(body).not.toMatch(/from\s+["'].*runtime_execution/);
            expect(body).not.toMatch(/from\s+["'].*orchestration/);
            expect(body).not.toMatch(/\basync\b/);
            expect(body).not.toMatch(/\bfetch\b|\bhttp\b/);
            expect(body).not.toMatch(/getInstance\s*\(/);
            expect(body).not.toMatch(/service\s*locator/i);
            expect(body).not.toMatch(/injectable|inversify|tsyringe/i);
        }
    });

    test("references Chapter 26 ConstructionPlanningContract without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(SRC_DIR, "ConstructionPlanningDefinitionTypes.ts"),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_planning_contract\/ConstructionPlanningContract["']/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningContract\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlan\b/
        );
    });

    test("builder instances are independent", () => {
        const contractA = sampleContract();
        const planB = new ConstructionPlanBuilder()
            .withPlanId("plan-b")
            .withMetadata(PLAN_META)
            .addReference(Object.freeze({ definitionReferenceId: "def-b" }))
            .build();
        const contractB = new ConstructionPlanningContractBuilder()
            .withContractId("cpc-b")
            .withMetadata(CONTRACT_META)
            .withConstructionPlan(planB)
            .build();

        const a = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("a")
            .withMetadata(META)
            .withConstructionPlanningContract(contractA)
            .build();
        const b = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("b")
            .withMetadata(META)
            .withConstructionPlanningContract(contractB)
            .build();

        expect(a.definitionId).toBe("a");
        expect(b.definitionId).toBe("b");
        expect(a.contents.constructionPlanningContract.contractId).toBe(
            "cpc-ok"
        );
        expect(b.contents.constructionPlanningContract.contractId).toBe(
            "cpc-b"
        );
    });
});
