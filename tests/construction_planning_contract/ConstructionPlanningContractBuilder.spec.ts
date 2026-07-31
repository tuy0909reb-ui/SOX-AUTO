import * as fs from "fs";
import * as path from "path";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContract } from "../../src/construction_planning_contract/ConstructionPlanningContract";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import type { ConstructionPlanningContractMetadata } from "../../src/construction_planning_contract/ConstructionPlanningContractTypes";

const PLAN_META = Object.freeze({
    identifier: "plan-for-builder",
    name: "Plan",
    version: "0.3",
});

const META: ConstructionPlanningContractMetadata = Object.freeze({
    identifier: "cpc-builder",
    name: "Builder Test Contract",
    version: "0.4",
});

function samplePlan() {
    return new ConstructionPlanBuilder()
        .withPlanId("plan-ok")
        .withMetadata(PLAN_META)
        .addReference(Object.freeze({ definitionReferenceId: "def-1" }))
        .build();
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_planning_contract"
);

describe("ASA-ARCH-26.0 — ConstructionPlanningContractBuilder", () => {
    test("builder constructs immutable instances with structural validation only", () => {
        const plan = samplePlan();
        const contract = new ConstructionPlanningContractBuilder()
            .withContractId("cpc-ok")
            .withMetadata(META)
            .withConstructionPlan(plan)
            .build();

        expect(contract).toBeInstanceOf(ConstructionPlanningContract);
        expect(Object.isFrozen(contract)).toBe(true);
        expect(contract.definition.constructionPlan).toBe(plan);
    });

    test("structural validation rejects missing contractId", () => {
        expect(() =>
            new ConstructionPlanningContractBuilder()
                .withMetadata(META)
                .withConstructionPlan(samplePlan())
                .build()
        ).toThrow(/contractId is required/);
    });

    test("structural validation rejects missing metadata", () => {
        expect(() =>
            new ConstructionPlanningContractBuilder()
                .withContractId("cpc-1")
                .withConstructionPlan(samplePlan())
                .build()
        ).toThrow(/metadata is required/);
    });

    test("structural validation rejects missing constructionPlan", () => {
        expect(() =>
            new ConstructionPlanningContractBuilder()
                .withContractId("cpc-1")
                .withMetadata(META)
                .build()
        ).toThrow(/constructionPlan is required/);
    });

    test("withDefinition preserves ConstructionPlan by reference", () => {
        const plan = samplePlan();
        const contract = new ConstructionPlanningContractBuilder()
            .withContractId("cpc-def")
            .withMetadata(META)
            .withDefinition({
                constructionPlan: plan,
                permittedConsumers: ["c1"],
                permittedArchitecturalRelationships: ["r1"],
                declarativeUsageConstraints: ["u1"],
            })
            .build();

        expect(contract.definition.constructionPlan).toBe(plan);
        expect(contract.definition.permittedConsumers).toEqual(["c1"]);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionPlanningContract.ts",
            "ConstructionPlanningContractBuilder.ts",
            "ConstructionPlanningContractTypes.ts",
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

    test("references Chapter 25 ConstructionPlan without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(SRC_DIR, "ConstructionPlanningContractTypes.ts"),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_plan\/ConstructionPlan["']/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlan\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+interface\s+SelectedReference\b/
        );
    });

    test("does not redefine Construction Plan or Selection Result contracts", () => {
        const files = [
            "ConstructionPlanningContract.ts",
            "ConstructionPlanningContractBuilder.ts",
            "ConstructionPlanningContractTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /export\s+(interface|class|type)\s+ConstructionPlan\b/
            );
            expect(body).not.toMatch(
                /export\s+(interface|class|type)\s+ConstructionSelectionResult\b/
            );
        }
    });

    test("builder instances are independent", () => {
        const planA = samplePlan();
        const planB = new ConstructionPlanBuilder()
            .withPlanId("plan-b")
            .withMetadata(PLAN_META)
            .addReference(Object.freeze({ definitionReferenceId: "def-b" }))
            .build();

        const a = new ConstructionPlanningContractBuilder()
            .withContractId("a")
            .withMetadata(META)
            .withConstructionPlan(planA)
            .build();
        const b = new ConstructionPlanningContractBuilder()
            .withContractId("b")
            .withMetadata(META)
            .withConstructionPlan(planB)
            .build();

        expect(a.contractId).toBe("a");
        expect(b.contractId).toBe("b");
        expect(a.definition.constructionPlan.planId).toBe("plan-ok");
        expect(b.definition.constructionPlan.planId).toBe("plan-b");
    });
});
