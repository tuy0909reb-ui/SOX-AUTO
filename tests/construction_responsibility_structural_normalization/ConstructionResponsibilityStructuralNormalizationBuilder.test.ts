import * as fs from "fs";
import * as path from "path";
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
        .withPlanId("plan-ok")
        .withMetadata(
            Object.freeze({
                identifier: "plan",
                name: "Plan",
                version: "0.3",
            })
        )
        .addReference(Object.freeze({ definitionReferenceId: "def-1" }))
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("cpc-ok")
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
        .withDefinitionId("cpd-ok")
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
        .withSpecificationId("cps-ok")
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
        .withManifestId("cpm-ok")
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
        .withBoundaryId("cpcb-ok")
        .withArchitectureVersion("ASA-ARCH-30.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withManifest(manifest)
        .establish();

    const responsibility =
        new ConstructionStructuralResponsibilityBoundaryBuilder()
            .withBoundaryId("csrb-ok")
            .withArchitectureVersion("ASA-ARCH-31.0")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withResponsibilityDomainIdentifier("domain.structural.v1")
            .withConsumptionBoundary(consumption)
            .withStructuralResponsibilityMappings([
                Object.freeze({
                    structuralElementId: "element.root",
                    responsibilityDomainId: "domain.structural.v1",
                }),
            ])
            .establish();

    const interfaceDefinition =
        new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
            .withInterfaceDefinitionId("crsid-ok")
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
        .withValidationId("crscv-ok")
        .withArchitectureVersion("ASA-ARCH-33.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withCompatibilityRuleVersion("0.4")
        .withSourceInterfaceDefinition(interfaceDefinition)
        .validate();
}

function baseBuilder(
    source: ConstructionResponsibilityStructuralCompatibilityValidationRecord
): ConstructionResponsibilityStructuralNormalizationBuilder {
    return new ConstructionResponsibilityStructuralNormalizationBuilder()
        .withNormalizationId("crsn-ok")
        .withArchitectureVersion("ASA-ARCH-34.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withNormalizationRuleVersion("0.4")
        .withSourceValidationRecord(source);
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_responsibility_structural_normalization"
);

describe("ASA-ARCH-34.0 — ConstructionResponsibilityStructuralNormalizationBuilder", () => {
    test("normalize accepts compatible Chapter 33 validation record", () => {
        const source = sampleCompatibleValidation();
        const record = baseBuilder(source).normalize();

        expect(record).toBeInstanceOf(
            ConstructionResponsibilityStructuralNormalizationRecord
        );
        expect(Object.isFrozen(record)).toBe(true);
        expect(record.sourceValidationRecord).toBe(source);
        expect(record.metadata.normalizationStatus).toBe("normalized");
    });

    test("normalization rejects missing source Validation Record", () => {
        expect(() =>
            new ConstructionResponsibilityStructuralNormalizationBuilder()
                .withNormalizationId("crsn-1")
                .withArchitectureVersion("ASA-ARCH-34.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withNormalizationRuleVersion("0.4")
                .normalize()
        ).toThrow(/exactly one source Validation Record is required/);
    });

    test("normalization rejects incompatible Validation Record", () => {
        const real = sampleCompatibleValidation();
        const fake = Object.freeze({
            identity: real.identity,
            metadata: Object.freeze({
                ...real.metadata,
                compatibilityStatus: "incompatible" as const,
            }),
            sourceInterfaceDefinition: real.sourceInterfaceDefinition,
            compatibilityStatus: "incompatible" as const,
            incompatibilityConditions: Object.freeze([
                Object.freeze({
                    conditionId: "compat.bad",
                    structuralElementRef: "compatibilityConstraints[0]",
                }),
            ]),
        }) as ConstructionResponsibilityStructuralCompatibilityValidationRecord;

        expect(() => baseBuilder(fake).normalize()).toThrow(
            /only compatible Validation Records are accepted/
        );
    });

    test("normalization rejects missing normalizationId", () => {
        expect(() =>
            new ConstructionResponsibilityStructuralNormalizationBuilder()
                .withArchitectureVersion("ASA-ARCH-34.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withNormalizationRuleVersion("0.4")
                .withSourceValidationRecord(sampleCompatibleValidation())
                .normalize()
        ).toThrow(/normalizationId is required/);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionResponsibilityStructuralNormalizationRecord.ts",
            "ConstructionResponsibilityStructuralNormalizationBuilder.ts",
            "ConstructionResponsibilityStructuralNormalizationTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /\bfunction\s+(select|discover|resolve|load|lookup|bind|schedule|analyzeDependencies|planConstruction|optimize|traverse|interpret)\b/
            );
            expect(body).not.toMatch(
                /\bclass\s+(SelectionService|DiscoveryService|RegistryService|Planner|Scheduler|Dispatcher)\b/
            );
            expect(body).not.toMatch(/from\s+["'].*runtime_execution/);
            expect(body).not.toMatch(/from\s+["'].*orchestration/);
            expect(body).not.toMatch(/\basync\b/);
            expect(body).not.toMatch(/\bfetch\b|\bhttp\b/);
            expect(body).not.toMatch(/getInstance\s*\(/);
            expect(body).not.toMatch(/service\s*locator/i);
            expect(body).not.toMatch(/injectable|inversify|tsyringe/i);
        }
    });

    test("references Chapter 33 only — no direct Ch25–32 imports", () => {
        const files = [
            "ConstructionResponsibilityStructuralNormalizationRecord.ts",
            "ConstructionResponsibilityStructuralNormalizationBuilder.ts",
            "ConstructionResponsibilityStructuralNormalizationTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).toMatch(
                /construction_responsibility_structural_compatibility_validation/
            );
            expect(body).not.toMatch(/construction_plan\//);
            expect(body).not.toMatch(/construction_planning_contract\//);
            expect(body).not.toMatch(/construction_planning_definition\//);
            expect(body).not.toMatch(/construction_planning_specification\//);
            expect(body).not.toMatch(/construction_planning_manifest\//);
            expect(body).not.toMatch(
                /construction_planning_consumption_boundary\//
            );
            expect(body).not.toMatch(
                /construction_structural_responsibility_boundary\//
            );
            expect(body).not.toMatch(
                /construction_responsibility_structural_interface_definition\//
            );
        }
    });

    test("does not construct upstream validation or planning artifacts", () => {
        const files = [
            "ConstructionResponsibilityStructuralNormalizationRecord.ts",
            "ConstructionResponsibilityStructuralNormalizationBuilder.ts",
            "ConstructionResponsibilityStructuralNormalizationTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /new\s+ConstructionResponsibilityStructuralCompatibilityValidationRecord\b/
            );
            expect(body).not.toMatch(
                /ConstructionResponsibilityStructuralCompatibilityValidationBuilder/
            );
            expect(body).not.toMatch(/new\s+ConstructionPlanningManifest\b/);
        }
    });
});
