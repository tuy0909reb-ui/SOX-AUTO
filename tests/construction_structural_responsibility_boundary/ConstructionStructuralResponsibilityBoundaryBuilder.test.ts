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

function sampleConsumptionBoundary() {
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

    return new ConstructionPlanningConsumptionBoundaryBuilder()
        .withBoundaryId("cpcb-ok")
        .withArchitectureVersion("ASA-ARCH-30.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withManifest(manifest)
        .establish();
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_structural_responsibility_boundary"
);

describe("ASA-ARCH-31.0 — ConstructionStructuralResponsibilityBoundaryBuilder", () => {
    test("establish constructs immutable boundary with structural classification only", () => {
        const consumption = sampleConsumptionBoundary();
        const boundary = new ConstructionStructuralResponsibilityBoundaryBuilder()
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

        expect(boundary).toBeInstanceOf(
            ConstructionStructuralResponsibilityBoundary
        );
        expect(Object.isFrozen(boundary)).toBe(true);
        expect(boundary.sourceConsumptionBoundary).toBe(consumption);
    });

    test("establishment rejects missing Consumption Boundary", () => {
        expect(() =>
            new ConstructionStructuralResponsibilityBoundaryBuilder()
                .withBoundaryId("csrb-1")
                .withArchitectureVersion("ASA-ARCH-31.0")
                .withStructuralVersion("0.2")
                .withSchemaVersion("0.2")
                .withResponsibilityDomainIdentifier("domain.structural.v1")
                .withStructuralResponsibilityMappings([
                    Object.freeze({
                        structuralElementId: "element.root",
                        responsibilityDomainId: "domain.structural.v1",
                    }),
                ])
                .establish()
        ).toThrow(/exactly one Consumption Boundary is required/);
    });

    test("establishment rejects missing boundaryId", () => {
        expect(() =>
            new ConstructionStructuralResponsibilityBoundaryBuilder()
                .withArchitectureVersion("ASA-ARCH-31.0")
                .withStructuralVersion("0.2")
                .withSchemaVersion("0.2")
                .withResponsibilityDomainIdentifier("domain.structural.v1")
                .withConsumptionBoundary(sampleConsumptionBoundary())
                .withStructuralResponsibilityMappings([
                    Object.freeze({
                        structuralElementId: "element.root",
                        responsibilityDomainId: "domain.structural.v1",
                    }),
                ])
                .establish()
        ).toThrow(/boundaryId is required/);
    });

    test("establishment rejects empty structural responsibility mappings", () => {
        expect(() =>
            new ConstructionStructuralResponsibilityBoundaryBuilder()
                .withBoundaryId("csrb-1")
                .withArchitectureVersion("ASA-ARCH-31.0")
                .withStructuralVersion("0.2")
                .withSchemaVersion("0.2")
                .withResponsibilityDomainIdentifier("domain.structural.v1")
                .withConsumptionBoundary(sampleConsumptionBoundary())
                .establish()
        ).toThrow(/at least one structural responsibility mapping is required/);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionStructuralResponsibilityBoundary.ts",
            "ConstructionStructuralResponsibilityBoundaryBuilder.ts",
            "ConstructionStructuralResponsibilityBoundaryTypes.ts",
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

    test("references Chapter 30 Consumption Boundary without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(
                SRC_DIR,
                "ConstructionStructuralResponsibilityBoundaryTypes.ts"
            ),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_planning_consumption_boundary\/ConstructionPlanningConsumptionBoundary["']/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningConsumptionBoundary\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningManifest\b/
        );
    });

    test("production sources do not import Chapters 25–29 directly", () => {
        const files = [
            "ConstructionStructuralResponsibilityBoundary.ts",
            "ConstructionStructuralResponsibilityBoundaryBuilder.ts",
            "ConstructionStructuralResponsibilityBoundaryTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(/construction_plan\//);
            expect(body).not.toMatch(/construction_planning_contract\//);
            expect(body).not.toMatch(/construction_planning_definition\//);
            expect(body).not.toMatch(/construction_planning_specification\//);
            expect(body).not.toMatch(/construction_planning_manifest\//);
        }
    });

    test("does not construct another Manifest or planning artifact", () => {
        const files = [
            "ConstructionStructuralResponsibilityBoundary.ts",
            "ConstructionStructuralResponsibilityBoundaryBuilder.ts",
            "ConstructionStructuralResponsibilityBoundaryTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(/new\s+ConstructionPlanningManifest\b/);
            expect(body).not.toMatch(/ConstructionPlanningManifestBuilder/);
            expect(body).not.toMatch(
                /new\s+ConstructionPlanningConsumptionBoundary\b/
            );
            expect(body).not.toMatch(
                /ConstructionPlanningConsumptionBoundaryBuilder/
            );
        }
    });
});
