import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";
import { ConstructionStructuralResponsibilityBoundary } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary";
import { ConstructionStructuralResponsibilityBoundaryBuilder } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder";
import { ConstructionResponsibilityStructuralInterfaceDefinition } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition";
import { ConstructionResponsibilityStructuralInterfaceDefinitionBuilder } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder";

function sampleResponsibilityBoundary(): ConstructionStructuralResponsibilityBoundary {
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

    const consumption = new ConstructionPlanningConsumptionBoundaryBuilder()
        .withBoundaryId("cpcb.pipeline.v1")
        .withArchitectureVersion("ASA-ARCH-30.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withManifest(manifest)
        .establish();

    return new ConstructionStructuralResponsibilityBoundaryBuilder()
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
}

function defineValid(
    source: ConstructionStructuralResponsibilityBoundary
): ConstructionResponsibilityStructuralInterfaceDefinition {
    return new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
        .withInterfaceDefinitionId("crsid.pipeline.v1")
        .withArchitectureVersion("ASA-ARCH-32.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withSourceResponsibilityBoundary(source)
        .withResponsibilityDomainStructure(
            Object.freeze({
                responsibilityDomainId: "domain.structural.v1",
                domainStructureId: "domain.structure.v1",
            })
        )
        .withInputStructureDefinition(
            Object.freeze({ structureId: "input.structure.v1" })
        )
        .withOutputStructureDefinition(
            Object.freeze({ structureId: "output.structure.v1" })
        )
        .withCompatibilityConstraints([
            Object.freeze({
                constraintId: "compat.v1",
                requiredInputStructureId: "input.structure.v1",
                requiredOutputStructureId: "output.structure.v1",
            }),
        ])
        .define();
}

describe("ASA-ARCH-32.0 — ConstructionResponsibilityStructuralInterfaceDefinition", () => {
    test("immutable definition preserves source identities", () => {
        const source = sampleResponsibilityBoundary();
        const definition = defineValid(source);

        expect(definition).toBeInstanceOf(
            ConstructionResponsibilityStructuralInterfaceDefinition
        );
        expect(Object.isFrozen(definition)).toBe(true);
        expect(Object.isFrozen(definition.identity)).toBe(true);
        expect(Object.isFrozen(definition.metadata)).toBe(true);
        expect(definition.sourceResponsibilityBoundary).toBe(source);
        expect(definition.identity.sourceResponsibilityBoundaryId).toBe(
            source.identity.boundaryId
        );
        expect(definition.identity.sourceManifestId).toBe(
            source.identity.sourceManifestId
        );
        expect(definition.metadata.validationStatus).toBe("defined");
        expect(Object.keys(definition).sort()).toEqual([
            "compatibilityConstraints",
            "identity",
            "inputStructureDefinition",
            "metadata",
            "outputStructureDefinition",
            "responsibilityDomainStructure",
            "sourceResponsibilityBoundary",
        ]);
        expect(definition).not.toHaveProperty("runtime");
        expect(definition).not.toHaveProperty("capability");
        expect(definition).not.toHaveProperty("execution");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const definition = defineValid(sampleResponsibilityBoundary());
        const serialized = JSON.stringify(definition);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/capability/i);
        expect(JSON.parse(serialized).identity.interfaceDefinitionId).toBe(
            "crsid.pipeline.v1"
        );
    });
});
