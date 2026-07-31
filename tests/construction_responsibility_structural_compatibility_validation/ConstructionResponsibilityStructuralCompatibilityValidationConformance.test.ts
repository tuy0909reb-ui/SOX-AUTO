import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";
import { ConstructionStructuralResponsibilityBoundaryBuilder } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder";
import { ConstructionResponsibilityStructuralInterfaceDefinition } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition";
import { ConstructionResponsibilityStructuralInterfaceDefinitionBuilder } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder";
import { ConstructionResponsibilityStructuralCompatibilityValidationBuilder } from "../../src/construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationBuilder";

function sampleInterfaceDefinition(): ConstructionResponsibilityStructuralInterfaceDefinition {
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

    const responsibility =
        new ConstructionStructuralResponsibilityBoundaryBuilder()
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

    return new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
        .withInterfaceDefinitionId("crsid-conformance")
        .withArchitectureVersion("ASA-ARCH-32.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withSourceResponsibilityBoundary(responsibility)
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

describe("ASA-ARCH-33.0 — Structural Compatibility Validation Conformance", () => {
    test("preserves Chapter 32 / boundary / Manifest identities", () => {
        const source = sampleInterfaceDefinition();
        const record =
            new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
                .withValidationId("crscv-conformance")
                .withArchitectureVersion("ASA-ARCH-33.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withCompatibilityRuleVersion("0.4")
                .withSourceInterfaceDefinition(source)
                .validate();

        expect(record.sourceInterfaceDefinition).toBe(source);
        expect(record.identity.sourceInterfaceDefinitionId).toBe(
            source.identity.interfaceDefinitionId
        );
        expect(record.identity.sourceResponsibilityBoundaryId).toBe(
            source.identity.sourceResponsibilityBoundaryId
        );
        expect(record.identity.sourceManifestId).toBe(
            source.identity.sourceManifestId
        );
        expect(record.metadata.sourceInterfaceDefinitionIdentifier).toBe(
            source.identity.interfaceDefinitionId
        );
        expect(record).not.toHaveProperty("architecturallyAcceptedManifest");
        expect(record).not.toHaveProperty("sourceResponsibilityBoundary");
    });

    test("validation is deterministic for the same inputs", () => {
        const source = sampleInterfaceDefinition();
        const build = () =>
            new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
                .withValidationId("crscv-det")
                .withArchitectureVersion("ASA-ARCH-33.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withCompatibilityRuleVersion("0.4")
                .withSourceInterfaceDefinition(source)
                .validate();

        const a = build();
        const b = build();
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.sourceInterfaceDefinition).toBe(b.sourceInterfaceDefinition);
        expect(a.compatibilityStatus).toBe("compatible");
    });

    test("does not expose execution readiness or capability fields", () => {
        const record =
            new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
                .withValidationId("crscv-structure")
                .withArchitectureVersion("ASA-ARCH-33.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withCompatibilityRuleVersion("0.4")
                .withSourceInterfaceDefinition(sampleInterfaceDefinition())
                .validate();

        expect(record).not.toHaveProperty("executionReadiness");
        expect(record).not.toHaveProperty("capabilityBinding");
        expect(record).not.toHaveProperty("implementationSelection");
        expect(record.metadata.compatibilityStatus).toBe(
            record.compatibilityStatus
        );
    });
});
