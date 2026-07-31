import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";
import { ConstructionStructuralResponsibilityBoundary } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary";
import { ConstructionStructuralResponsibilityBoundaryBuilder } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder";
import { ConstructionResponsibilityStructuralInterfaceDefinitionBuilder } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder";

function sampleResponsibilityBoundary(): ConstructionStructuralResponsibilityBoundary {
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

    const consumption = new ConstructionPlanningConsumptionBoundaryBuilder()
        .withBoundaryId("cpcb-conformance")
        .withArchitectureVersion("ASA-ARCH-30.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withManifest(manifest)
        .establish();

    return new ConstructionStructuralResponsibilityBoundaryBuilder()
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
}

describe("ASA-ARCH-32.0 — Structural Interface Definition Conformance", () => {
    test("preserves Chapter 31 and Manifest identities without redefinition", () => {
        const source = sampleResponsibilityBoundary();
        const definition =
            new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
                .withInterfaceDefinitionId("crsid-conformance")
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

        expect(definition.sourceResponsibilityBoundary).toBe(source);
        expect(definition.identity.sourceResponsibilityBoundaryId).toBe(
            source.identity.boundaryId
        );
        expect(definition.identity.sourceManifestId).toBe(
            source.identity.sourceManifestId
        );
        expect(
            definition.metadata.sourceResponsibilityBoundaryIdentifier
        ).toBe(source.identity.boundaryId);
        expect(definition).not.toHaveProperty(
            "architecturallyAcceptedManifest"
        );
    });

    test("exposes structural connection requirements only", () => {
        const source = sampleResponsibilityBoundary();
        const definition =
            new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
                .withInterfaceDefinitionId("crsid-structure")
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

        expect(definition.inputStructureDefinition.structureId).toBe(
            "input.structure.v1"
        );
        expect(definition.outputStructureDefinition.structureId).toBe(
            "output.structure.v1"
        );
        expect(definition.compatibilityConstraints).toHaveLength(1);
        expect(definition).not.toHaveProperty("executionReadiness");
        expect(definition).not.toHaveProperty("capabilityBinding");
        expect(definition).not.toHaveProperty("implementationSelection");
    });

    test("definition is deterministic for the same inputs", () => {
        const source = sampleResponsibilityBoundary();
        const build = () =>
            new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
                .withInterfaceDefinitionId("crsid-det")
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

        const a = build();
        const b = build();
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.sourceResponsibilityBoundary).toBe(
            b.sourceResponsibilityBoundary
        );
    });
});
