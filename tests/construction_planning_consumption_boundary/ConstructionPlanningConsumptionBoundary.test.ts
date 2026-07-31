import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundary } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";

function sampleManifest() {
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

    return new ConstructionPlanningManifestBuilder()
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
}

describe("ASA-ARCH-30.0 — ConstructionPlanningConsumptionBoundary", () => {
    test("immutable boundary preserves Manifest by identity (no new planning artifact)", () => {
        const manifest = sampleManifest();
        const boundary = new ConstructionPlanningConsumptionBoundaryBuilder()
            .withBoundaryId("cpcb.pipeline.v1")
            .withArchitectureVersion("ASA-ARCH-30.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withManifest(manifest)
            .establish();

        expect(boundary).toBeInstanceOf(
            ConstructionPlanningConsumptionBoundary
        );
        expect(Object.isFrozen(boundary)).toBe(true);
        expect(Object.isFrozen(boundary.identity)).toBe(true);
        expect(Object.isFrozen(boundary.metadata)).toBe(true);
        expect(boundary.architecturallyAcceptedManifest).toBe(manifest);
        expect(boundary.identity.manifestId).toBe(manifest.manifestId);
        expect(boundary.metadata.validationStatus).toBe("accepted");
        expect(Object.keys(boundary).sort()).toEqual([
            "architecturallyAcceptedManifest",
            "identity",
            "metadata",
        ]);
        expect(boundary).not.toHaveProperty("runtime");
        expect(boundary).not.toHaveProperty("planning");
        expect(boundary).not.toHaveProperty("scheduler");
        expect(boundary).not.toHaveProperty("algorithm");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const boundary = new ConstructionPlanningConsumptionBoundaryBuilder()
            .withBoundaryId("cpcb-serialize")
            .withArchitectureVersion("ASA-ARCH-30.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withManifest(sampleManifest())
            .establish();

        const serialized = JSON.stringify(boundary);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/planner/i);
        expect(JSON.parse(serialized).identity.boundaryId).toBe(
            "cpcb-serialize"
        );
    });
});
