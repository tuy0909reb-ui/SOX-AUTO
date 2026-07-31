import * as fs from "fs";
import * as path from "path";
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

    return new ConstructionStructuralResponsibilityBoundaryBuilder()
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
}

function baseBuilder(
    source: ConstructionStructuralResponsibilityBoundary
): ConstructionResponsibilityStructuralInterfaceDefinitionBuilder {
    return new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
        .withInterfaceDefinitionId("crsid-ok")
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
        ]);
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_responsibility_structural_interface_definition"
);

describe("ASA-ARCH-32.0 — ConstructionResponsibilityStructuralInterfaceDefinitionBuilder", () => {
    test("define accepts valid Chapter 31 boundary and creates immutable definition", () => {
        const source = sampleResponsibilityBoundary();
        const definition = baseBuilder(source).define();

        expect(definition).toBeInstanceOf(
            ConstructionResponsibilityStructuralInterfaceDefinition
        );
        expect(Object.isFrozen(definition)).toBe(true);
        expect(definition.sourceResponsibilityBoundary).toBe(source);
        expect(definition.identity.sourceManifestId).toBe(
            source.identity.sourceManifestId
        );
        expect(definition.metadata.responsibilityDomainIdentifier).toBe(
            "domain.structural.v1"
        );
    });

    test("definition rejects missing source boundary", () => {
        expect(() =>
            new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
                .withInterfaceDefinitionId("crsid-1")
                .withArchitectureVersion("ASA-ARCH-32.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
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
                .define()
        ).toThrow(/exactly one source Responsibility Boundary is required/);
    });

    test("definition rejects missing Manifest identity on source boundary", () => {
        const real = sampleResponsibilityBoundary();
        const fake = Object.freeze({
            identity: Object.freeze({
                boundaryId: real.identity.boundaryId,
                sourceManifestId: "",
                architectureVersion: real.identity.architectureVersion,
                structuralVersion: real.identity.structuralVersion,
            }),
            metadata: real.metadata,
            sourceConsumptionBoundary: real.sourceConsumptionBoundary,
            structuralResponsibilityMappings:
                real.structuralResponsibilityMappings,
        }) as ConstructionStructuralResponsibilityBoundary;

        expect(() => baseBuilder(fake).define()).toThrow(
            /sourceManifestId is required/
        );
    });

    test("definition rejects missing responsibility domain structure", () => {
        const source = sampleResponsibilityBoundary();
        expect(() =>
            new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
                .withInterfaceDefinitionId("crsid-1")
                .withArchitectureVersion("ASA-ARCH-32.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
                .withSourceResponsibilityBoundary(source)
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
                .define()
        ).toThrow(/responsibility domain structure is required/);
    });

    test("definition rejects missing input structure definition", () => {
        const source = sampleResponsibilityBoundary();
        expect(() =>
            new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
                .withInterfaceDefinitionId("crsid-1")
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
                .define()
        ).toThrow(/input structure definition is required/);
    });

    test("definition rejects missing output structure definition", () => {
        const source = sampleResponsibilityBoundary();
        expect(() =>
            new ConstructionResponsibilityStructuralInterfaceDefinitionBuilder()
                .withInterfaceDefinitionId("crsid-1")
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
                .withCompatibilityConstraints([
                    Object.freeze({
                        constraintId: "compat.v1",
                        requiredInputStructureId: "input.structure.v1",
                        requiredOutputStructureId: "output.structure.v1",
                    }),
                ])
                .define()
        ).toThrow(/output structure definition is required/);
    });

    test("definition rejects invalid compatibility constraints", () => {
        const source = sampleResponsibilityBoundary();
        expect(() =>
            baseBuilder(source)
                .withCompatibilityConstraints([
                    Object.freeze({
                        constraintId: "compat.bad",
                        requiredInputStructureId: "other.input",
                        requiredOutputStructureId: "output.structure.v1",
                    }),
                ])
                .define()
        ).toThrow(/invalid compatibility constraints/);
    });

    test("definition rejects incompatible responsibility domain", () => {
        const source = sampleResponsibilityBoundary();
        expect(() =>
            baseBuilder(source)
                .withResponsibilityDomainStructure(
                    Object.freeze({
                        responsibilityDomainId: "domain.other.v1",
                        domainStructureId: "domain.structure.v1",
                    })
                )
                .define()
        ).toThrow(/responsibility domain structure is incompatible/);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionResponsibilityStructuralInterfaceDefinition.ts",
            "ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.ts",
            "ConstructionResponsibilityStructuralInterfaceDefinitionTypes.ts",
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

    test("references Chapter 31 only — no direct Ch25–30 imports", () => {
        const files = [
            "ConstructionResponsibilityStructuralInterfaceDefinition.ts",
            "ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.ts",
            "ConstructionResponsibilityStructuralInterfaceDefinitionTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).toMatch(
                /construction_structural_responsibility_boundary/
            );
            expect(body).not.toMatch(/construction_plan\//);
            expect(body).not.toMatch(/construction_planning_contract\//);
            expect(body).not.toMatch(/construction_planning_definition\//);
            expect(body).not.toMatch(/construction_planning_specification\//);
            expect(body).not.toMatch(/construction_planning_manifest\//);
            expect(body).not.toMatch(
                /construction_planning_consumption_boundary\//
            );
        }
    });

    test("does not construct upstream boundaries or planning artifacts", () => {
        const files = [
            "ConstructionResponsibilityStructuralInterfaceDefinition.ts",
            "ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.ts",
            "ConstructionResponsibilityStructuralInterfaceDefinitionTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /new\s+ConstructionStructuralResponsibilityBoundary\b/
            );
            expect(body).not.toMatch(
                /ConstructionStructuralResponsibilityBoundaryBuilder/
            );
            expect(body).not.toMatch(/new\s+ConstructionPlanningManifest\b/);
            expect(body).not.toMatch(/ConstructionPlanningManifestBuilder/);
        }
    });
});
