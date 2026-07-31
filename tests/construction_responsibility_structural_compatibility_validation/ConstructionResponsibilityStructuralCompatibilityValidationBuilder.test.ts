import * as fs from "fs";
import * as path from "path";
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

    return new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
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
}

function baseBuilder(
    source: ConstructionResponsibilityStructuralInterfaceDefinition
): ConstructionResponsibilityStructuralCompatibilityValidationBuilder {
    return new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
        .withValidationId("crscv-ok")
        .withArchitectureVersion("ASA-ARCH-33.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withCompatibilityRuleVersion("0.4")
        .withSourceInterfaceDefinition(source);
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_responsibility_structural_compatibility_validation"
);

describe("ASA-ARCH-33.0 — ConstructionResponsibilityStructuralCompatibilityValidationBuilder", () => {
    test("validate accepts valid Chapter 32 definition as compatible", () => {
        const source = sampleInterfaceDefinition();
        const record = baseBuilder(source).validate();

        expect(record).toBeInstanceOf(
            ConstructionResponsibilityStructuralCompatibilityValidationRecord
        );
        expect(Object.isFrozen(record)).toBe(true);
        expect(record.compatibilityStatus).toBe("compatible");
        expect(record.sourceInterfaceDefinition).toBe(source);
    });

    test("validation rejects missing source Interface Definition", () => {
        expect(() =>
            new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
                .withValidationId("crscv-1")
                .withArchitectureVersion("ASA-ARCH-33.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withCompatibilityRuleVersion("0.4")
                .validate()
        ).toThrow(/exactly one source Interface Definition is required/);
    });

    test("validation rejects missing validationId", () => {
        expect(() =>
            new ConstructionResponsibilityStructuralCompatibilityValidationBuilder()
                .withArchitectureVersion("ASA-ARCH-33.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withCompatibilityRuleVersion("0.4")
                .withSourceInterfaceDefinition(sampleInterfaceDefinition())
                .validate()
        ).toThrow(/validationId is required/);
    });

    test("records incompatible status without modifying source definition", () => {
        const real = sampleInterfaceDefinition();
        const fake = Object.freeze({
            identity: real.identity,
            metadata: real.metadata,
            sourceResponsibilityBoundary: real.sourceResponsibilityBoundary,
            responsibilityDomainStructure: real.responsibilityDomainStructure,
            inputStructureDefinition: real.inputStructureDefinition,
            outputStructureDefinition: real.outputStructureDefinition,
            compatibilityConstraints: Object.freeze([
                Object.freeze({
                    constraintId: "compat.bad",
                    requiredInputStructureId: "other.input",
                    requiredOutputStructureId: "output.structure.v1",
                }),
            ]),
        }) as ConstructionResponsibilityStructuralInterfaceDefinition;

        const record = baseBuilder(fake).validate();
        expect(record.compatibilityStatus).toBe("incompatible");
        expect(record.incompatibilityConditions.length).toBeGreaterThan(0);
        expect(record.sourceInterfaceDefinition).toBe(fake);
        expect(fake.compatibilityConstraints[0].requiredInputStructureId).toBe(
            "other.input"
        );
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionResponsibilityStructuralCompatibilityValidationRecord.ts",
            "ConstructionResponsibilityStructuralCompatibilityValidationBuilder.ts",
            "ConstructionResponsibilityStructuralCompatibilityValidationTypes.ts",
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

    test("references Chapter 32 only — no direct Ch25–31 imports", () => {
        const files = [
            "ConstructionResponsibilityStructuralCompatibilityValidationRecord.ts",
            "ConstructionResponsibilityStructuralCompatibilityValidationBuilder.ts",
            "ConstructionResponsibilityStructuralCompatibilityValidationTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).toMatch(
                /construction_responsibility_structural_interface_definition/
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
        }
    });

    test("does not construct upstream definitions or planning artifacts", () => {
        const files = [
            "ConstructionResponsibilityStructuralCompatibilityValidationRecord.ts",
            "ConstructionResponsibilityStructuralCompatibilityValidationBuilder.ts",
            "ConstructionResponsibilityStructuralCompatibilityValidationTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /new\s+ConstructionResponsibilityStructuralInterfaceDefinition\b/
            );
            expect(body).not.toMatch(
                /ConstructionResponsibilityStructuralInterfaceDefinitionBuilder/
            );
            expect(body).not.toMatch(/new\s+ConstructionPlanningManifest\b/);
        }
    });
});
