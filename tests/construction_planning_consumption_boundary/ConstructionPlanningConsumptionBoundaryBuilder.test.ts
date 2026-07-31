import * as fs from "fs";
import * as path from "path";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import { ConstructionPlanningConsumptionBoundary } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary";
import { ConstructionPlanningConsumptionBoundaryBuilder } from "../../src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder";

function sampleManifest() {
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

    return new ConstructionPlanningManifestBuilder()
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
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_planning_consumption_boundary"
);

describe("ASA-ARCH-30.0 — ConstructionPlanningConsumptionBoundaryBuilder", () => {
    test("establish constructs immutable boundary with structural acceptance only", () => {
        const manifest = sampleManifest();
        const boundary = new ConstructionPlanningConsumptionBoundaryBuilder()
            .withBoundaryId("cpcb-ok")
            .withArchitectureVersion("ASA-ARCH-30.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withManifest(manifest)
            .establish();

        expect(boundary).toBeInstanceOf(
            ConstructionPlanningConsumptionBoundary
        );
        expect(Object.isFrozen(boundary)).toBe(true);
        expect(boundary.architecturallyAcceptedManifest).toBe(manifest);
    });

    test("establishment rejects missing Manifest", () => {
        expect(() =>
            new ConstructionPlanningConsumptionBoundaryBuilder()
                .withBoundaryId("cpcb-1")
                .withArchitectureVersion("ASA-ARCH-30.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
                .establish()
        ).toThrow(/exactly one Manifest is required/);
    });

    test("establishment rejects missing boundaryId", () => {
        expect(() =>
            new ConstructionPlanningConsumptionBoundaryBuilder()
                .withArchitectureVersion("ASA-ARCH-30.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
                .withManifest(sampleManifest())
                .establish()
        ).toThrow(/boundaryId is required/);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionPlanningConsumptionBoundary.ts",
            "ConstructionPlanningConsumptionBoundaryBuilder.ts",
            "ConstructionPlanningConsumptionBoundaryTypes.ts",
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

    test("references Chapter 29 ConstructionPlanningManifest without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(
                SRC_DIR,
                "ConstructionPlanningConsumptionBoundaryTypes.ts"
            ),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_planning_manifest\/ConstructionPlanningManifest["']/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningManifest\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningSpecification\b/
        );
    });

    test("does not construct another Manifest or planning artifact", () => {
        const files = [
            "ConstructionPlanningConsumptionBoundary.ts",
            "ConstructionPlanningConsumptionBoundaryBuilder.ts",
            "ConstructionPlanningConsumptionBoundaryTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /new\s+ConstructionPlanningManifest\b/
            );
            expect(body).not.toMatch(
                /ConstructionPlanningManifestBuilder/
            );
        }
    });
});
