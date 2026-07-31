import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";
import { ConstructionStructuralResponsibilityBoundary } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary";
import { ConstructionStructuralResponsibilityBoundaryBuilder } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder";

function sampleConsumptionBoundary() {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("construction.plan.pipeline.v1")
        .withMetadata(
            Object.freeze({
                identifier: "plan",
                name: "Plan",
                version: "0.3",
            })
        )
        .withContents([
            Object.freeze({ definitionReferenceId: "definition.ref.a" }),
        ])
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("construction.planning.contract.pipeline.v1")
        .withMetadata(
            Object.freeze({
                identifier: "contract",
                name: "Contract",
                version: "0.4",
            })
        )
        .withConstructionPlan(plan)
        .build();

    const definition = new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("construction.planning.definition.pipeline.v1")
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
        .withSpecificationId(
            "construction.planning.specification.pipeline.v1"
        )
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
        .withManifestId("construction.planning.manifest.pipeline.v1")
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
        .withBoundaryId("cpcb.pipeline.v1")
        .withArchitectureVersion("ASA-ARCH-30.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withManifest(manifest)
        .establish();
}

describe("ASA-ARCH-31.0 — ConstructionStructuralResponsibilityBoundary", () => {
    test("immutable boundary preserves Consumption Boundary and Manifest identity", () => {
        const consumption = sampleConsumptionBoundary();
        const boundary = new ConstructionStructuralResponsibilityBoundaryBuilder()
            .withBoundaryId("csrb.pipeline.v1")
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

        expect(boundary).toBeInstanceOf(
            ConstructionStructuralResponsibilityBoundary
        );
        expect(Object.isFrozen(boundary)).toBe(true);
        expect(Object.isFrozen(boundary.identity)).toBe(true);
        expect(Object.isFrozen(boundary.metadata)).toBe(true);
        expect(Object.isFrozen(boundary.structuralResponsibilityMappings)).toBe(
            true
        );
        expect(boundary.sourceConsumptionBoundary).toBe(consumption);
        expect(boundary.identity.sourceManifestId).toBe(
            consumption.identity.manifestId
        );
        expect(boundary.metadata.validationStatus).toBe("established");
        expect(Object.keys(boundary).sort()).toEqual([
            "identity",
            "metadata",
            "sourceConsumptionBoundary",
            "structuralResponsibilityMappings",
        ]);
        expect(boundary).not.toHaveProperty("runtime");
        expect(boundary).not.toHaveProperty("planning");
        expect(boundary).not.toHaveProperty("scheduler");
        expect(boundary).not.toHaveProperty("algorithm");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const boundary = new ConstructionStructuralResponsibilityBoundaryBuilder()
            .withBoundaryId("csrb-serialize")
            .withArchitectureVersion("ASA-ARCH-31.0")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withResponsibilityDomainIdentifier("domain.structural.v1")
            .withConsumptionBoundary(sampleConsumptionBoundary())
            .withStructuralResponsibilityMappings([
                Object.freeze({
                    structuralElementId: "manifest.structure.root",
                    responsibilityDomainId: "domain.structural.v1",
                }),
            ])
            .establish();

        const serialized = JSON.stringify(boundary);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/planner/i);
        expect(JSON.parse(serialized).identity.boundaryId).toBe(
            "csrb-serialize"
        );
    });
});
