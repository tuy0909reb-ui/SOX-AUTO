import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifest } from "../../src/construction_planning_manifest/ConstructionPlanningManifest";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";

function sampleManifest(): ConstructionPlanningManifest {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("plan-conformance")
        .withMetadata(
            Object.freeze({
                identifier: "plan",
                name: "Plan",
                version: "0.3",
            })
        )
        .withContents([
            Object.freeze({ definitionReferenceId: "ref.a" }),
            Object.freeze({ definitionReferenceId: "ref.b" }),
        ])
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("contract-conformance")
        .withMetadata(
            Object.freeze({
                identifier: "contract",
                name: "Contract",
                version: "0.4",
            })
        )
        .withConstructionPlan(plan)
        .withPermittedConsumers(["consumer.a"])
        .build();

    const definition = new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("definition-conformance")
        .withMetadata(
            Object.freeze({
                identifier: "definition",
                name: "Definition",
                version: "0.5",
            })
        )
        .withConstructionPlanningContract(contract)
        .build();

    const specification = new ConstructionPlanningSpecificationBuilder()
        .withSpecificationId("specification-conformance")
        .withMetadata(
            Object.freeze({
                identifier: "specification",
                name: "Specification",
                version: "0.4",
            })
        )
        .withConstructionPlanningDefinition(definition)
        .build();

    return new ConstructionPlanningManifestBuilder()
        .withManifestId("manifest-conformance")
        .withMetadata(
            Object.freeze({
                identifier: "manifest",
                name: "Manifest",
                version: "0.3",
            })
        )
        .withConstructionPlanningSpecification(specification)
        .build();
}

describe("ASA-ARCH-30.0 — Consumption Boundary Conformance", () => {
    test("Architecturally Accepted Manifest is the original Manifest (no new artifact)", () => {
        const manifest = sampleManifest();
        const beforeId = manifest.manifestId;
        const beforeSpecId =
            manifest.contents.constructionPlanningSpecification
                .specificationId;

        const boundary = new ConstructionPlanningConsumptionBoundaryBuilder()
            .withBoundaryId("cpcb-conformance")
            .withArchitectureVersion("ASA-ARCH-30.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withManifest(manifest)
            .establish();

        const accepted = boundary.architecturallyAcceptedManifest;
        expect(accepted).toBe(manifest);
        expect(accepted).toBeInstanceOf(ConstructionPlanningManifest);
        expect(accepted.manifestId).toBe(beforeId);
        expect(boundary.identity.manifestId).toBe(beforeId);
        expect(
            accepted.contents.constructionPlanningSpecification.specificationId
        ).toBe(beforeSpecId);
        expect(boundary.metadata.manifestIdentifier).toBe(beforeId);
    });

    test("boundary preserves full declarative chain without transformation", () => {
        const manifest = sampleManifest();
        const boundary = new ConstructionPlanningConsumptionBoundaryBuilder()
            .withBoundaryId("cpcb-consistency")
            .withArchitectureVersion("ASA-ARCH-30.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withManifest(manifest)
            .establish();

        const accepted = boundary.architecturallyAcceptedManifest;
        const plan =
            accepted.contents.constructionPlanningSpecification.contents
                .constructionPlanningDefinition.contents
                .constructionPlanningContract.definition.constructionPlan;

        expect(plan.planId).toBe("plan-conformance");
        expect(plan.contents).toHaveLength(2);
        expect(accepted.contents.constructionPlanningSpecification).toBe(
            manifest.contents.constructionPlanningSpecification
        );
    });

    test("boundary establishment is deterministic for the same inputs", () => {
        const manifest = sampleManifest();
        const a = new ConstructionPlanningConsumptionBoundaryBuilder()
            .withBoundaryId("cpcb-det")
            .withArchitectureVersion("ASA-ARCH-30.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withManifest(manifest)
            .establish();
        const b = new ConstructionPlanningConsumptionBoundaryBuilder()
            .withBoundaryId("cpcb-det")
            .withArchitectureVersion("ASA-ARCH-30.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withManifest(manifest)
            .establish();

        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.architecturallyAcceptedManifest).toBe(
            b.architecturallyAcceptedManifest
        );
    });
});
