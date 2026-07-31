import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinition } from "../../src/construction_planning_definition/ConstructionPlanningDefinition";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import type { ConstructionPlanningSpecificationMetadata } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationTypes";

const PLAN_META = Object.freeze({
    identifier: "plan-spec-conformance",
    name: "Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "contract-spec-conformance",
    name: "Contract",
    version: "0.4",
});

const DEF_META = Object.freeze({
    identifier: "definition-spec-conformance",
    name: "Definition",
    version: "0.5",
});

const SPEC_META: ConstructionPlanningSpecificationMetadata = Object.freeze({
    identifier: "specification-conformance",
    name: "Specification",
    version: "0.4",
});

function sampleDefinition(): ConstructionPlanningDefinition {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("plan-conformance")
        .withMetadata(PLAN_META)
        .withContents([
            Object.freeze({ definitionReferenceId: "ref.a" }),
            Object.freeze({ definitionReferenceId: "ref.b" }),
        ])
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("contract-conformance")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .withPermittedConsumers(["consumer.a", "consumer.b"])
        .withPermittedArchitecturalRelationships(["rel.a"])
        .withDeclarativeUsageConstraints(["usage.a"])
        .build();

    return new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("definition-conformance")
        .withMetadata(DEF_META)
        .withConstructionPlanningContract(contract)
        .build();
}

describe("ASA-ARCH-28.0 — ConstructionPlanningSpecification Conformance", () => {
    test("specification conforms to and preserves ConstructionPlanningDefinition", () => {
        const definition = sampleDefinition();
        const specification = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("specification-conformance")
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(definition)
            .build();

        const preserved =
            specification.contents.constructionPlanningDefinition;
        expect(preserved).toBe(definition);
        expect(preserved).toBeInstanceOf(ConstructionPlanningDefinition);
        expect(preserved.definitionId).toBe("definition-conformance");
        expect(
            preserved.contents.constructionPlanningContract.contractId
        ).toBe("contract-conformance");
        expect(
            preserved.contents.constructionPlanningContract.definition
                .permittedConsumers
        ).toEqual(["consumer.a", "consumer.b"]);
    });

    test("specification remains structurally consistent with definition chain", () => {
        const definition = sampleDefinition();
        const specification = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("specification-consistency")
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(definition)
            .build();

        const preserved =
            specification.contents.constructionPlanningDefinition;
        const plan =
            preserved.contents.constructionPlanningContract.definition
                .constructionPlan;

        expect(plan.planId).toBe("plan-conformance");
        expect(plan.contents).toHaveLength(2);
        expect(plan.contents[0].definitionReferenceId).toBe("ref.a");
        expect(plan.contents[1].definitionReferenceId).toBe("ref.b");
        expect(Object.isFrozen(preserved)).toBe(true);
        expect(Object.isFrozen(preserved.contents)).toBe(true);
    });

    test("specification does not redefine or transform ConstructionPlanningDefinition", () => {
        const definition = sampleDefinition();
        const beforeDefinitionId = definition.definitionId;
        const beforeContractId =
            definition.contents.constructionPlanningContract.contractId;
        const beforePlanId =
            definition.contents.constructionPlanningContract.definition
                .constructionPlan.planId;
        const beforeConsumers = [
            ...definition.contents.constructionPlanningContract.definition
                .permittedConsumers,
        ];

        const specification = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("specification-no-transform")
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(definition)
            .build();

        const preserved =
            specification.contents.constructionPlanningDefinition;
        expect(preserved.definitionId).toBe(beforeDefinitionId);
        expect(preserved.contents.constructionPlanningContract.contractId).toBe(
            beforeContractId
        );
        expect(
            preserved.contents.constructionPlanningContract.definition
                .constructionPlan.planId
        ).toBe(beforePlanId);
        expect(
            preserved.contents.constructionPlanningContract.definition
                .permittedConsumers
        ).toEqual(beforeConsumers);
        expect(preserved.contents.constructionPlanningContract).toBe(
            definition.contents.constructionPlanningContract
        );
    });
});
