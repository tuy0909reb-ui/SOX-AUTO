import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContract } from "../../src/construction_planning_contract/ConstructionPlanningContract";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import type { ConstructionPlanningDefinitionMetadata } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionTypes";

const PLAN_META = Object.freeze({
    identifier: "plan-contract-conformance",
    name: "Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "contract-conformance",
    name: "Contract",
    version: "0.4",
});

const DEF_META: ConstructionPlanningDefinitionMetadata = Object.freeze({
    identifier: "definition-conformance",
    name: "Definition",
    version: "0.5",
});

function sampleContract(): ConstructionPlanningContract {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("plan-conformance")
        .withMetadata(PLAN_META)
        .withContents([
            Object.freeze({ definitionReferenceId: "ref.a" }),
            Object.freeze({ definitionReferenceId: "ref.b" }),
        ])
        .build();

    return new ConstructionPlanningContractBuilder()
        .withContractId("contract-conformance")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .withPermittedConsumers(["consumer.a", "consumer.b"])
        .withPermittedArchitecturalRelationships(["rel.a"])
        .withDeclarativeUsageConstraints(["usage.a"])
        .build();
}

describe("ASA-ARCH-27.0 — ConstructionPlanningDefinition Contract Conformance", () => {
    test("definition conforms to and preserves ConstructionPlanningContract", () => {
        const contract = sampleContract();
        const definition = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("definition-conformance")
            .withMetadata(DEF_META)
            .withConstructionPlanningContract(contract)
            .build();

        const preserved = definition.contents.constructionPlanningContract;
        expect(preserved).toBe(contract);
        expect(preserved).toBeInstanceOf(ConstructionPlanningContract);
        expect(preserved.contractId).toBe("contract-conformance");
        expect(preserved.definition.permittedConsumers).toEqual([
            "consumer.a",
            "consumer.b",
        ]);
        expect(preserved.definition.permittedArchitecturalRelationships).toEqual(
            ["rel.a"]
        );
        expect(preserved.definition.declarativeUsageConstraints).toEqual([
            "usage.a",
        ]);
    });

    test("definition remains structurally consistent with contract constraints", () => {
        const contract = sampleContract();
        const definition = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("definition-consistency")
            .withMetadata(DEF_META)
            .withConstructionPlanningContract(contract)
            .build();

        const preserved = definition.contents.constructionPlanningContract;
        expect(preserved.definition.constructionPlan.planId).toBe(
            "plan-conformance"
        );
        expect(preserved.definition.constructionPlan.contents).toHaveLength(2);
        expect(preserved.definition.constructionPlan.contents[0].definitionReferenceId).toBe(
            "ref.a"
        );
        expect(preserved.definition.constructionPlan.contents[1].definitionReferenceId).toBe(
            "ref.b"
        );
        expect(Object.isFrozen(preserved.definition.permittedConsumers)).toBe(
            true
        );
        expect(Object.isFrozen(preserved.definition)).toBe(true);
    });

    test("definition does not redefine or transform contractual constraints", () => {
        const contract = sampleContract();
        const beforeConsumers = [
            ...contract.definition.permittedConsumers,
        ];
        const beforeRelationships = [
            ...contract.definition.permittedArchitecturalRelationships,
        ];
        const beforeUsage = [
            ...contract.definition.declarativeUsageConstraints,
        ];

        const definition = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("definition-no-transform")
            .withMetadata(DEF_META)
            .withConstructionPlanningContract(contract)
            .build();

        const preserved = definition.contents.constructionPlanningContract;
        expect(preserved.definition.permittedConsumers).toEqual(beforeConsumers);
        expect(
            preserved.definition.permittedArchitecturalRelationships
        ).toEqual(beforeRelationships);
        expect(preserved.definition.declarativeUsageConstraints).toEqual(
            beforeUsage
        );
        expect(preserved.definition.constructionPlan).toBe(
            contract.definition.constructionPlan
        );
    });
});
