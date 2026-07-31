import * as fs from "fs";
import * as path from "path";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecification } from "../../src/construction_planning_specification/ConstructionPlanningSpecification";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import type { ConstructionPlanningSpecificationMetadata } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationTypes";

const PLAN_META = Object.freeze({
    identifier: "plan-for-spec-builder",
    name: "Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "contract-for-spec-builder",
    name: "Contract",
    version: "0.4",
});

const DEF_META = Object.freeze({
    identifier: "definition-for-spec-builder",
    name: "Definition",
    version: "0.5",
});

const META: ConstructionPlanningSpecificationMetadata = Object.freeze({
    identifier: "cps-builder",
    name: "Builder Test Specification",
    version: "0.4",
});

function sampleDefinition() {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("plan-ok")
        .withMetadata(PLAN_META)
        .addReference(Object.freeze({ definitionReferenceId: "def-1" }))
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("cpc-ok")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .build();

    return new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("cpd-ok")
        .withMetadata(DEF_META)
        .withConstructionPlanningContract(contract)
        .build();
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_planning_specification"
);

describe("ASA-ARCH-28.0 — ConstructionPlanningSpecificationBuilder", () => {
    test("builder constructs immutable instances with structural validation only", () => {
        const definition = sampleDefinition();
        const specification = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("cps-ok")
            .withMetadata(META)
            .withConstructionPlanningDefinition(definition)
            .build();

        expect(specification).toBeInstanceOf(ConstructionPlanningSpecification);
        expect(Object.isFrozen(specification)).toBe(true);
        expect(specification.contents.constructionPlanningDefinition).toBe(
            definition
        );
    });

    test("structural validation rejects missing specificationId", () => {
        expect(() =>
            new ConstructionPlanningSpecificationBuilder()
                .withMetadata(META)
                .withConstructionPlanningDefinition(sampleDefinition())
                .build()
        ).toThrow(/specificationId is required/);
    });

    test("structural validation rejects missing metadata", () => {
        expect(() =>
            new ConstructionPlanningSpecificationBuilder()
                .withSpecificationId("cps-1")
                .withConstructionPlanningDefinition(sampleDefinition())
                .build()
        ).toThrow(/metadata is required/);
    });

    test("structural validation rejects missing constructionPlanningDefinition", () => {
        expect(() =>
            new ConstructionPlanningSpecificationBuilder()
                .withSpecificationId("cps-1")
                .withMetadata(META)
                .build()
        ).toThrow(/constructionPlanningDefinition is required/);
    });

    test("withContents preserves ConstructionPlanningDefinition by reference", () => {
        const definition = sampleDefinition();
        const specification = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("cps-contents")
            .withMetadata(META)
            .withContents({ constructionPlanningDefinition: definition })
            .build();

        expect(specification.contents.constructionPlanningDefinition).toBe(
            definition
        );
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionPlanningSpecification.ts",
            "ConstructionPlanningSpecificationBuilder.ts",
            "ConstructionPlanningSpecificationTypes.ts",
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

    test("references Chapter 27 ConstructionPlanningDefinition without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(SRC_DIR, "ConstructionPlanningSpecificationTypes.ts"),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_planning_definition\/ConstructionPlanningDefinition["']/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningDefinition\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningContract\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlan\b/
        );
    });

    test("builder instances are independent", () => {
        const definitionA = sampleDefinition();
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
        const definitionB = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("cpd-b")
            .withMetadata(DEF_META)
            .withConstructionPlanningContract(contractB)
            .build();

        const a = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("a")
            .withMetadata(META)
            .withConstructionPlanningDefinition(definitionA)
            .build();
        const b = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("b")
            .withMetadata(META)
            .withConstructionPlanningDefinition(definitionB)
            .build();

        expect(a.specificationId).toBe("a");
        expect(b.specificationId).toBe("b");
        expect(
            a.contents.constructionPlanningDefinition.definitionId
        ).toBe("cpd-ok");
        expect(
            b.contents.constructionPlanningDefinition.definitionId
        ).toBe("cpd-b");
    });
});
