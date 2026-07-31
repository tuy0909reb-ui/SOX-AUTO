import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinition } from "../../src/construction_planning_definition/ConstructionPlanningDefinition";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import type { ConstructionPlanningDefinitionMetadata } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionTypes";

const PLAN_META = Object.freeze({
    identifier: "construction.plan.pipeline.v1",
    name: "Pipeline Construction Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "construction.planning.contract.pipeline.v1",
    name: "Pipeline Construction Planning Contract",
    version: "0.4",
});

const DEF_META: ConstructionPlanningDefinitionMetadata = Object.freeze({
    identifier: "construction.planning.definition.pipeline.v1",
    name: "Pipeline Construction Planning Definition",
    version: "0.5",
    description: "Declarative definition governed by Construction Planning Contract",
});

function sampleContract() {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("construction.plan.pipeline.v1")
        .withMetadata(PLAN_META)
        .withContents([
            Object.freeze({ definitionReferenceId: "definition.ref.a" }),
            Object.freeze({ definitionReferenceId: "definition.ref.b" }),
        ])
        .build();

    return new ConstructionPlanningContractBuilder()
        .withContractId("construction.planning.contract.pipeline.v1")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .withPermittedConsumers(["ASA-ARCH-27.0"])
        .withPermittedArchitecturalRelationships([
            "ConstructionPlan -> ConstructionPlanningDefinition",
        ])
        .withDeclarativeUsageConstraints(["consume-contract-declaratively-only"])
        .build();
}

describe("ASA-ARCH-27.0 — ConstructionPlanningDefinition", () => {
    test("immutable definition with identity, metadata, and preserved contract", () => {
        const contract = sampleContract();
        const definition = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("construction.planning.definition.pipeline.v1")
            .withMetadata(DEF_META)
            .withConstructionPlanningContract(contract)
            .build();

        expect(definition).toBeInstanceOf(ConstructionPlanningDefinition);
        expect(Object.isFrozen(definition)).toBe(true);
        expect(Object.isFrozen(definition.metadata)).toBe(true);
        expect(Object.isFrozen(definition.contents)).toBe(true);
        expect(definition.definitionId).toBe(
            "construction.planning.definition.pipeline.v1"
        );
        expect(definition.contents.constructionPlanningContract).toBe(contract);
        expect(Object.keys(definition).sort()).toEqual([
            "contents",
            "definitionId",
            "metadata",
        ]);
        expect(definition).not.toHaveProperty("runtime");
        expect(definition).not.toHaveProperty("planning");
        expect(definition).not.toHaveProperty("scheduler");
        expect(definition).not.toHaveProperty("algorithm");
    });

    test("runtime isolation — no runtime fields on definition model", () => {
        const definition = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("cpd-rt")
            .withMetadata(DEF_META)
            .withConstructionPlanningContract(sampleContract())
            .build();

        const serialized = JSON.stringify(definition);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/planner/i);
    });
});
