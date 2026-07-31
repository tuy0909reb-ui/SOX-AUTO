import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";
import { ConstructionStructuralResponsibilityBoundaryBuilder } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder";
import { ConstructionResponsibilityStructuralInterfaceDefinition } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition";
import { ConstructionResponsibilityStructuralInterfaceDefinitionBuilder } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder";
import { ConstructionResponsibilityStructuralCompatibilityValidationRecord } from "../../src/construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationRecord";
import { ConstructionResponsibilityStructuralCompatibilityValidationBuilder } from "../../src/construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationBuilder";

function sampleInterfaceDefinition(): ConstructionResponsibilityStructuralInterfaceDefinition {
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

    const responsibility =
        new ConstructionStructuralResponsibilityBoundaryBuilder()
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

    return new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
        .withInterfaceDefinitionId("crsid.pipeline.v1")
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

describe("ASA-ARCH-33.0 — ConstructionResponsibilityStructuralCompatibilityValidationRecord", () => {
    test("immutable compatible record preserves upstream identities", () => {
        const source = sampleInterfaceDefinition();
        const record =
            new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
                .withValidationId("crscv.pipeline.v1")
                .withArchitectureVersion("ASA-ARCH-33.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withCompatibilityRuleVersion("0.4")
                .withSourceInterfaceDefinition(source)
                .validate();

        expect(record).toBeInstanceOf(
            ConstructionResponsibilityStructuralCompatibilityValidationRecord
        );
        expect(Object.isFrozen(record)).toBe(true);
        expect(Object.isFrozen(record.identity)).toBe(true);
        expect(Object.isFrozen(record.metadata)).toBe(true);
        expect(record.sourceInterfaceDefinition).toBe(source);
        expect(record.compatibilityStatus).toBe("compatible");
        expect(record.incompatibilityConditions).toHaveLength(0);
        expect(record.identity.sourceInterfaceDefinitionId).toBe(
            source.identity.interfaceDefinitionId
        );
        expect(record.identity.sourceResponsibilityBoundaryId).toBe(
            source.identity.sourceResponsibilityBoundaryId
        );
        expect(record.identity.sourceManifestId).toBe(
            source.identity.sourceManifestId
        );
        expect(Object.keys(record).sort()).toEqual([
            "compatibilityStatus",
            "identity",
            "incompatibilityConditions",
            "metadata",
            "sourceInterfaceDefinition",
        ]);
        expect(record).not.toHaveProperty("runtime");
        expect(record).not.toHaveProperty("capability");
        expect(record).not.toHaveProperty("execution");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const record =
            new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
                .withValidationId("crscv-serialize")
                .withArchitectureVersion("ASA-ARCH-33.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withCompatibilityRuleVersion("0.4")
                .withSourceInterfaceDefinition(sampleInterfaceDefinition())
                .validate();

        const serialized = JSON.stringify(record);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/capability/i);
        expect(JSON.parse(serialized).identity.validationId).toBe(
            "crscv-serialize"
        );
    });
});
