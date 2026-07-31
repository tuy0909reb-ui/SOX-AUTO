import { ConstructionPlan } from "../../src/construction_plan/ConstructionPlan";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContract } from "../../src/construction_planning_contract/ConstructionPlanningContract";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import type { ConstructionPlanningContractMetadata } from "../../src/construction_planning_contract/ConstructionPlanningContractTypes";

const PLAN_META = Object.freeze({
    identifier: "construction.plan.pipeline.v1",
    name: "Pipeline Construction Plan",
    version: "0.3",
});

const CONTRACT_META: ConstructionPlanningContractMetadata = Object.freeze({
    identifier: "construction.planning.contract.pipeline.v1",
    name: "Pipeline Construction Planning Contract",
    version: "0.4",
    description: "Declarative contract governing Construction Plan consumption",
});

function samplePlan(): ConstructionPlan {
    return new ConstructionPlanBuilder()
        .withPlanId("construction.plan.pipeline.v1")
        .withMetadata(PLAN_META)
        .withContents([
            Object.freeze({ definitionReferenceId: "definition.ref.a" }),
            Object.freeze({ definitionReferenceId: "definition.ref.b" }),
        ])
        .build();
}

describe("ASA-ARCH-26.0 — ConstructionPlanningContract", () => {
    test("immutable contract with identity, metadata, and preserved ConstructionPlan", () => {
        const plan = samplePlan();
        const contract = new ConstructionPlanningContractBuilder()
            .withContractId("construction.planning.contract.pipeline.v1")
            .withMetadata(CONTRACT_META)
            .withConstructionPlan(plan)
            .withPermittedConsumers(["ASA-ARCH-27.0"])
            .withPermittedArchitecturalRelationships([
                "ConstructionPlan -> SubsequentDeclarativeStage",
            ])
            .withDeclarativeUsageConstraints([
                "consume-plan-declaratively-only",
            ])
            .build();

        expect(contract).toBeInstanceOf(ConstructionPlanningContract);
        expect(Object.isFrozen(contract)).toBe(true);
        expect(Object.isFrozen(contract.metadata)).toBe(true);
        expect(Object.isFrozen(contract.definition)).toBe(true);
        expect(contract.contractId).toBe(
            "construction.planning.contract.pipeline.v1"
        );
        expect(contract.definition.constructionPlan).toBe(plan);
        expect(contract.definition.constructionPlan.planId).toBe(
            "construction.plan.pipeline.v1"
        );
        expect(contract.definition.constructionPlan.contents).toHaveLength(2);
        expect(Object.keys(contract).sort()).toEqual([
            "contractId",
            "definition",
            "metadata",
        ]);
        expect(contract).not.toHaveProperty("runtime");
        expect(contract).not.toHaveProperty("planning");
        expect(contract).not.toHaveProperty("scheduler");
        expect(contract).not.toHaveProperty("algorithm");
    });

    test("definition constraint arrays are frozen and preserve caller values", () => {
        const plan = samplePlan();
        const contract = new ConstructionPlanningContractBuilder()
            .withContractId("cpc-1")
            .withMetadata(CONTRACT_META)
            .withConstructionPlan(plan)
            .withPermittedConsumers(["consumer.a", "consumer.b"])
            .withPermittedArchitecturalRelationships(["rel.a"])
            .withDeclarativeUsageConstraints(["constraint.a"])
            .build();

        expect(
            Object.isFrozen(contract.definition.permittedConsumers)
        ).toBe(true);
        expect(
            Object.isFrozen(
                contract.definition.permittedArchitecturalRelationships
            )
        ).toBe(true);
        expect(
            Object.isFrozen(contract.definition.declarativeUsageConstraints)
        ).toBe(true);
        expect(contract.definition.permittedConsumers).toEqual([
            "consumer.a",
            "consumer.b",
        ]);
    });

    test("runtime isolation — no runtime fields on contract model", () => {
        const plan = samplePlan();
        const contract = new ConstructionPlanningContractBuilder()
            .withContractId("cpc-rt")
            .withMetadata(CONTRACT_META)
            .withConstructionPlan(plan)
            .build();

        const serialized = JSON.stringify(contract);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/planner/i);
    });
});
