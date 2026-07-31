import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";
import { ConstructionStructuralResponsibilityBoundaryBuilder } from "../../src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder";
import { ConstructionResponsibilityStructuralInterfaceDefinitionBuilder } from "../../src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder";
import { ConstructionResponsibilityStructuralCompatibilityValidationRecord } from "../../src/construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationRecord";
import { ConstructionResponsibilityStructuralCompatibilityValidationBuilder } from "../../src/construction_responsibility_structural_compatibility_validation/ConstructionResponsibilityStructuralCompatibilityValidationBuilder";
import { ConstructionResponsibilityStructuralNormalizationRecord } from "../../src/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationRecord";
import { ConstructionResponsibilityStructuralNormalizationBuilder } from "../../src/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationBuilder";

function sampleCompatibleValidation(): ConstructionResponsibilityStructuralCompatibilityValidationRecord {
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

    const interfaceDefinition =
        new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
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
                    constraintId: "compat.b",
                    requiredInputStructureId: "input.structure.v1",
                    requiredOutputStructureId: "output.structure.v1",
                }),
                Object.freeze({
                    constraintId: "compat.a",
                    requiredInputStructureId: "input.structure.v1",
                    requiredOutputStructureId: "output.structure.v1",
                }),
            ])
            .define();

    return new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
        .withValidationId("crscv.pipeline.v1")
        .withArchitectureVersion("ASA-ARCH-33.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withCompatibilityRuleVersion("0.4")
        .withSourceInterfaceDefinition(interfaceDefinition)
        .validate();
}

describe("ASA-ARCH-34.0 — ConstructionResponsibilityStructuralNormalizationRecord", () => {
    test("immutable normalized record preserves upstream identities", () => {
        const source = sampleCompatibleValidation();
        const record =
            new ConstructionResponsibilityStructuralNormalizationBuilder()
                .withNormalizationId("crsn.pipeline.v1")
                .withArchitectureVersion("ASA-ARCH-34.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withNormalizationRuleVersion("0.4")
                .withSourceValidationRecord(source)
                .normalize();

        expect(record).toBeInstanceOf(
            ConstructionResponsibilityStructuralNormalizationRecord
        );
        expect(Object.isFrozen(record)).toBe(true);
        expect(Object.isFrozen(record.identity)).toBe(true);
        expect(Object.isFrozen(record.metadata)).toBe(true);
        expect(record.sourceValidationRecord).toBe(source);
        expect(record.metadata.normalizationStatus).toBe("normalized");
        expect(record.identity.sourceValidationId).toBe(
            source.identity.validationId
        );
        expect(record.identity.sourceInterfaceDefinitionId).toBe(
            source.identity.sourceInterfaceDefinitionId
        );
        expect(record.identity.sourceResponsibilityBoundaryId).toBe(
            source.identity.sourceResponsibilityBoundaryId
        );
        expect(
            record.normalizedStructuralRepresentation.compatibilityConstraintIds
        ).toEqual(["compat.a", "compat.b"]);
        expect(Object.keys(record).sort()).toEqual([
            "identity",
            "metadata",
            "normalizedStructuralRepresentation",
            "sourceValidationRecord",
        ]);
        expect(record).not.toHaveProperty("runtime");
        expect(record).not.toHaveProperty("capability");
        expect(record).not.toHaveProperty("execution");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const record =
            new ConstructionResponsibilityStructuralNormalizationBuilder()
                .withNormalizationId("crsn-serialize")
                .withArchitectureVersion("ASA-ARCH-34.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withNormalizationRuleVersion("0.4")
                .withSourceValidationRecord(sampleCompatibleValidation())
                .normalize();

        const serialized = JSON.stringify(record);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/capability/i);
        expect(JSON.parse(serialized).identity.normalizationId).toBe(
            "crsn-serialize"
        );
    });
});
