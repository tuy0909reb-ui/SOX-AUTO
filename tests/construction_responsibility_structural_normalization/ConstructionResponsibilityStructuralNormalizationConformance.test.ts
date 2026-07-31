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
import { ConstructionResponsibilityStructuralNormalizationBuilder } from "../../src/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationBuilder";

function sampleCompatibleValidation(): ConstructionResponsibilityStructuralCompatibilityValidationRecord {
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

    const interfaceDefinition =
        new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
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

    return new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
        .withValidationId("crscv-conformance")
        .withArchitectureVersion("ASA-ARCH-33.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withCompatibilityRuleVersion("0.4")
        .withSourceInterfaceDefinition(interfaceDefinition)
        .validate();
}

describe("ASA-ARCH-34.0 — Structural Normalization Conformance", () => {
    test("preserves Chapter 33 / interface / boundary identities without mutation", () => {
        const source = sampleCompatibleValidation();
        const record =
            new ConstructionResponsibilityStructuralNormalizationBuilder()
                .withNormalizationId("crsn-conformance")
                .withArchitectureVersion("ASA-ARCH-34.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withNormalizationRuleVersion("0.4")
                .withSourceValidationRecord(source)
                .normalize();

        expect(record.sourceValidationRecord).toBe(source);
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
            record.normalizedStructuralRepresentation.sourceManifestId
        ).toBe(source.identity.sourceManifestId);
        expect(record).not.toHaveProperty("architecturallyAcceptedManifest");
        expect(source.compatibilityStatus).toBe("compatible");
    });

    test("preserves structural equivalence of domain / input / output ids", () => {
        const source = sampleCompatibleValidation();
        const iface = source.sourceInterfaceDefinition;
        const record =
            new ConstructionResponsibilityStructuralNormalizationBuilder()
                .withNormalizationId("crsn-equivalence")
                .withArchitectureVersion("ASA-ARCH-34.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withNormalizationRuleVersion("0.4")
                .withSourceValidationRecord(source)
                .normalize();

        const norm = record.normalizedStructuralRepresentation;
        expect(norm.responsibilityDomainId).toBe(
            iface.responsibilityDomainStructure.responsibilityDomainId
        );
        expect(norm.domainStructureId).toBe(
            iface.responsibilityDomainStructure.domainStructureId
        );
        expect(norm.inputStructureId).toBe(
            iface.inputStructureDefinition.structureId
        );
        expect(norm.outputStructureId).toBe(
            iface.outputStructureDefinition.structureId
        );
        expect(norm.compatibilityConstraintIds).toEqual(
            iface.compatibilityConstraints.map((c) => c.constraintId).sort()
        );
    });

    test("normalization is deterministic for the same inputs", () => {
        const source = sampleCompatibleValidation();
        const build = () =>
            new ConstructionResponsibilityStructuralNormalizationBuilder()
                .withNormalizationId("crsn-det")
                .withArchitectureVersion("ASA-ARCH-34.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withNormalizationRuleVersion("0.4")
                .withSourceValidationRecord(source)
                .normalize();

        const a = build();
        const b = build();
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.sourceValidationRecord).toBe(b.sourceValidationRecord);
    });
});
