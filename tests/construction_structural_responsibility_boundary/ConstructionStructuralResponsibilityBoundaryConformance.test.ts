import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundary } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";
import { ConstructionStructuralResponsibilityBoundaryBuilder } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder";

function sampleConsumptionBoundary(): ConstructionPlanningConsumptionBoundary {
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

    const manifest = new ConstructionPlanningManifestBuilder()
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

    return new ConstructionPlanningConsumptionBoundaryBuilder()
        .withBoundaryId("cpcb-conformance")
        .withArchitectureVersion("ASA-ARCH-30.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withManifest(manifest)
        .establish();
}

describe("ASA-ARCH-31.0 — Structural Responsibility Boundary Conformance", () => {
    test("preserves Accepted Manifest identity through Chapter 30 only", () => {
        const consumption = sampleConsumptionBoundary();
        const beforeId = consumption.identity.manifestId;
        const accepted =
            consumption.architecturallyAcceptedManifest;

        const boundary = new ConstructionStructuralResponsibilityBoundaryBuilder()
            .withBoundaryId("csrb-conformance")
            .withArchitectureVersion("ASA-ARCH-31.0")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withResponsibilityDomainIdentifier("domain.structural.v1")
            .withConsumptionBoundary(consumption)
            .withStructuralResponsibilityMappings([
                Object.freeze({
                    structuralElementId: "manifest.structure.root",
                    responsibilityDomainId: "domain.structural.v1",
                }),
            ])
            .establish();

        expect(boundary.sourceConsumptionBoundary).toBe(consumption);
        expect(boundary.identity.sourceManifestId).toBe(beforeId);
        expect(boundary.metadata.manifestIdentifier).toBe(beforeId);
        expect(boundary.metadata.sourceBoundaryIdentifier).toBe(
            consumption.identity.boundaryId
        );
        expect(
            boundary.sourceConsumptionBoundary.architecturallyAcceptedManifest
        ).toBe(accepted);
        expect(
            boundary.sourceConsumptionBoundary.architecturallyAcceptedManifest
                .manifestId
        ).toBe(beforeId);
    });

    test("structural responsibility mapping is classification only (not planning duplication)", () => {
        const consumption = sampleConsumptionBoundary();
        const boundary = new ConstructionStructuralResponsibilityBoundaryBuilder()
            .withBoundaryId("csrb-mapping")
            .withArchitectureVersion("ASA-ARCH-31.0")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withResponsibilityDomainIdentifier("domain.structural.v1")
            .withConsumptionBoundary(consumption)
            .withStructuralResponsibilityMappings([
                Object.freeze({
                    structuralElementId: "element.a",
                    responsibilityDomainId: "domain.structural.v1",
                }),
                Object.freeze({
                    structuralElementId: "element.b",
                    responsibilityDomainId: "domain.downstream.v1",
                }),
            ])
            .establish();

        expect(boundary.structuralResponsibilityMappings).toHaveLength(2);
        expect(boundary.structuralResponsibilityMappings[0]).toEqual({
            structuralElementId: "element.a",
            responsibilityDomainId: "domain.structural.v1",
        });
        expect(boundary).not.toHaveProperty("contents");
        expect(boundary).not.toHaveProperty("architecturallyAcceptedManifest");
    });

    test("boundary establishment is deterministic for the same inputs", () => {
        const consumption = sampleConsumptionBoundary();
        const mappings = [
            Object.freeze({
                structuralElementId: "element.root",
                responsibilityDomainId: "domain.structural.v1",
            }),
        ];
        const a = new ConstructionStructuralResponsibilityBoundaryBuilder()
            .withBoundaryId("csrb-det")
            .withArchitectureVersion("ASA-ARCH-31.0")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withResponsibilityDomainIdentifier("domain.structural.v1")
            .withConsumptionBoundary(consumption)
            .withStructuralResponsibilityMappings(mappings)
            .establish();
        const b = new ConstructionStructuralResponsibilityBoundaryBuilder()
            .withBoundaryId("csrb-det")
            .withArchitectureVersion("ASA-ARCH-31.0")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withResponsibilityDomainIdentifier("domain.structural.v1")
            .withConsumptionBoundary(consumption)
            .withStructuralResponsibilityMappings(mappings)
            .establish();

        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.sourceConsumptionBoundary).toBe(b.sourceConsumptionBoundary);
    });
});
