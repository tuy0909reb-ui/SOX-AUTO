import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecification } from "../../src/construction_planning_specification/ConstructionPlanningSpecification";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import type { ConstructionPlanningSpecificationMetadata } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationTypes";

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

const DEF_META = Object.freeze({
    identifier: "construction.planning.definition.pipeline.v1",
    name: "Pipeline Construction Planning Definition",
    version: "0.5",
});

const SPEC_META: ConstructionPlanningSpecificationMetadata = Object.freeze({
    identifier: "construction.planning.specification.pipeline.v1",
    name: "Pipeline Construction Planning Specification",
    version: "0.4",
    description:
        "Declarative specification conforming to Construction Planning Definition",
});

function sampleDefinition() {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("construction.plan.pipeline.v1")
        .withMetadata(PLAN_META)
        .withContents([
            Object.freeze({ definitionReferenceId: "definition.ref.a" }),
            Object.freeze({ definitionReferenceId: "definition.ref.b" }),
        ])
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("construction.planning.contract.pipeline.v1")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .withPermittedConsumers(["ASA-ARCH-28.0"])
        .withPermittedArchitecturalRelationships([
            "ConstructionPlanningDefinition -> ConstructionPlanningSpecification",
        ])
        .withDeclarativeUsageConstraints([
            "consume-definition-declaratively-only",
        ])
        .build();

    return new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("construction.planning.definition.pipeline.v1")
        .withMetadata(DEF_META)
        .withConstructionPlanningContract(contract)
        .build();
}

describe("ASA-ARCH-28.0 — ConstructionPlanningSpecification", () => {
    test("immutable specification with identity, metadata, and preserved definition", () => {
        const definition = sampleDefinition();
        const specification = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId(
                "construction.planning.specification.pipeline.v1"
            )
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(definition)
            .build();

        expect(specification).toBeInstanceOf(ConstructionPlanningSpecification);
        expect(Object.isFrozen(specification)).toBe(true);
        expect(Object.isFrozen(specification.metadata)).toBe(true);
        expect(Object.isFrozen(specification.contents)).toBe(true);
        expect(specification.specificationId).toBe(
            "construction.planning.specification.pipeline.v1"
        );
        expect(specification.metadata).toEqual(SPEC_META);
        expect(specification.contents.constructionPlanningDefinition).toBe(
            definition
        );
        expect(Object.keys(specification).sort()).toEqual([
            "contents",
            "metadata",
            "specificationId",
        ]);
        expect(specification).not.toHaveProperty("runtime");
        expect(specification).not.toHaveProperty("planning");
        expect(specification).not.toHaveProperty("scheduler");
        expect(specification).not.toHaveProperty("algorithm");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const specification = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("cps-serialize")
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(sampleDefinition())
            .build();

        const serialized = JSON.stringify(specification);
        const parsed = JSON.parse(serialized);

        expect(parsed.specificationId).toBe("cps-serialize");
        expect(parsed.metadata.identifier).toBe(SPEC_META.identifier);
        expect(
            parsed.contents.constructionPlanningDefinition.definitionId
        ).toBe("construction.planning.definition.pipeline.v1");
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/planner/i);
    });

    test("deterministic construction — same inputs yield equal declarative shape", () => {
        const definition = sampleDefinition();
        const a = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("cps-det")
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(definition)
            .build();
        const b = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("cps-det")
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(definition)
            .build();

        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.contents.constructionPlanningDefinition).toBe(
            b.contents.constructionPlanningDefinition
        );
    });
});
