import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecification } from "../../src/construction_planning_specification/ConstructionPlanningSpecification";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import type { ConstructionPlanningManifestMetadata } from "../../src/construction_planning_manifest/ConstructionPlanningManifestTypes";

const PLAN_META = Object.freeze({
    identifier: "plan-manifest-conformance",
    name: "Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "contract-manifest-conformance",
    name: "Contract",
    version: "0.4",
});

const DEF_META = Object.freeze({
    identifier: "definition-manifest-conformance",
    name: "Definition",
    version: "0.5",
});

const SPEC_META = Object.freeze({
    identifier: "specification-manifest-conformance",
    name: "Specification",
    version: "0.4",
});

const MANIFEST_META: ConstructionPlanningManifestMetadata = Object.freeze({
    identifier: "manifest-conformance",
    name: "Manifest",
    version: "0.3",
});

function sampleSpecification(): ConstructionPlanningSpecification {
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

    const definition = new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("definition-conformance")
        .withMetadata(DEF_META)
        .withConstructionPlanningContract(contract)
        .build();

    return new ConstructionPlanningSpecificationBuilder()
        .withSpecificationId("specification-conformance")
        .withMetadata(SPEC_META)
        .withConstructionPlanningDefinition(definition)
        .build();
}

describe("ASA-ARCH-29.0 — ConstructionPlanningManifest Conformance", () => {
    test("manifest conforms to and preserves ConstructionPlanningSpecification", () => {
        const specification = sampleSpecification();
        const manifest = new ConstructionPlanningManifestBuilder()
            .withManifestId("manifest-conformance")
            .withMetadata(MANIFEST_META)
            .withConstructionPlanningSpecification(specification)
            .build();

        const preserved =
            manifest.contents.constructionPlanningSpecification;
        expect(preserved).toBe(specification);
        expect(preserved).toBeInstanceOf(ConstructionPlanningSpecification);
        expect(preserved.specificationId).toBe("specification-conformance");
        expect(
            preserved.contents.constructionPlanningDefinition.definitionId
        ).toBe("definition-conformance");
        expect(
            preserved.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.contractId
        ).toBe("contract-conformance");
    });

    test("manifest remains structurally consistent with specification chain", () => {
        const specification = sampleSpecification();
        const manifest = new ConstructionPlanningManifestBuilder()
            .withManifestId("manifest-consistency")
            .withMetadata(MANIFEST_META)
            .withConstructionPlanningSpecification(specification)
            .build();

        const preserved =
            manifest.contents.constructionPlanningSpecification;
        const plan =
            preserved.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.definition.constructionPlan;

        expect(plan.planId).toBe("plan-conformance");
        expect(plan.contents).toHaveLength(2);
        expect(plan.contents[0].definitionReferenceId).toBe("ref.a");
        expect(plan.contents[1].definitionReferenceId).toBe("ref.b");
        expect(Object.isFrozen(preserved)).toBe(true);
        expect(Object.isFrozen(preserved.contents)).toBe(true);
    });

    test("manifest does not redefine or transform ConstructionPlanningSpecification", () => {
        const specification = sampleSpecification();
        const beforeSpecificationId = specification.specificationId;
        const beforeDefinitionId =
            specification.contents.constructionPlanningDefinition.definitionId;
        const beforeContractId =
            specification.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.contractId;
        const beforePlanId =
            specification.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.definition.constructionPlan
                .planId;
        const beforeConsumers = [
            ...specification.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.definition.permittedConsumers,
        ];

        const manifest = new ConstructionPlanningManifestBuilder()
            .withManifestId("manifest-no-transform")
            .withMetadata(MANIFEST_META)
            .withConstructionPlanningSpecification(specification)
            .build();

        const preserved =
            manifest.contents.constructionPlanningSpecification;
        expect(preserved.specificationId).toBe(beforeSpecificationId);
        expect(
            preserved.contents.constructionPlanningDefinition.definitionId
        ).toBe(beforeDefinitionId);
        expect(
            preserved.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.contractId
        ).toBe(beforeContractId);
        expect(
            preserved.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.definition.constructionPlan
                .planId
        ).toBe(beforePlanId);
        expect(
            preserved.contents.constructionPlanningDefinition.contents
                .constructionPlanningContract.definition.permittedConsumers
        ).toEqual(beforeConsumers);
        expect(preserved.contents.constructionPlanningDefinition).toBe(
            specification.contents.constructionPlanningDefinition
        );
    });
});
