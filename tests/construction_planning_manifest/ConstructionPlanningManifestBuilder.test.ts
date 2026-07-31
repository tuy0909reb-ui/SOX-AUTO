import * as fs from "fs";
import * as path from "path";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifest } from "../../src/construction_planning_manifest/ConstructionPlanningManifest";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import type { ConstructionPlanningManifestMetadata } from "../../src/construction_planning_manifest/ConstructionPlanningManifestTypes";

const PLAN_META = Object.freeze({
    identifier: "plan-for-manifest-builder",
    name: "Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "contract-for-manifest-builder",
    name: "Contract",
    version: "0.4",
});

const DEF_META = Object.freeze({
    identifier: "definition-for-manifest-builder",
    name: "Definition",
    version: "0.5",
});

const SPEC_META = Object.freeze({
    identifier: "specification-for-manifest-builder",
    name: "Specification",
    version: "0.4",
});

const META: ConstructionPlanningManifestMetadata = Object.freeze({
    identifier: "cpm-builder",
    name: "Builder Test Manifest",
    version: "0.3",
});

function sampleSpecification() {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("plan-ok")
        .withMetadata(PLAN_META)
        .addReference(Object.freeze({ definitionReferenceId: "def-1" }))
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("cpc-ok")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .build();

    const definition = new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("cpd-ok")
        .withMetadata(DEF_META)
        .withConstructionPlanningContract(contract)
        .build();

    return new ConstructionPlanningSpecificationBuilder()
        .withSpecificationId("cps-ok")
        .withMetadata(SPEC_META)
        .withConstructionPlanningDefinition(definition)
        .build();
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_planning_manifest"
);

describe("ASA-ARCH-29.0 — ConstructionPlanningManifestBuilder", () => {
    test("builder constructs immutable instances with structural validation only", () => {
        const specification = sampleSpecification();
        const manifest = new ConstructionPlanningManifestBuilder()
            .withManifestId("cpm-ok")
            .withMetadata(META)
            .withConstructionPlanningSpecification(specification)
            .build();

        expect(manifest).toBeInstanceOf(ConstructionPlanningManifest);
        expect(Object.isFrozen(manifest)).toBe(true);
        expect(manifest.contents.constructionPlanningSpecification).toBe(
            specification
        );
    });

    test("structural validation rejects missing manifestId", () => {
        expect(() =>
            new ConstructionPlanningManifestBuilder()
                .withMetadata(META)
                .withConstructionPlanningSpecification(sampleSpecification())
                .build()
        ).toThrow(/manifestId is required/);
    });

    test("structural validation rejects missing metadata", () => {
        expect(() =>
            new ConstructionPlanningManifestBuilder()
                .withManifestId("cpm-1")
                .withConstructionPlanningSpecification(sampleSpecification())
                .build()
        ).toThrow(/metadata is required/);
    });

    test("structural validation rejects missing constructionPlanningSpecification", () => {
        expect(() =>
            new ConstructionPlanningManifestBuilder()
                .withManifestId("cpm-1")
                .withMetadata(META)
                .build()
        ).toThrow(/constructionPlanningSpecification is required/);
    });

    test("withContents preserves ConstructionPlanningSpecification by reference", () => {
        const specification = sampleSpecification();
        const manifest = new ConstructionPlanningManifestBuilder()
            .withManifestId("cpm-contents")
            .withMetadata(META)
            .withContents({
                constructionPlanningSpecification: specification,
            })
            .build();

        expect(manifest.contents.constructionPlanningSpecification).toBe(
            specification
        );
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionPlanningManifest.ts",
            "ConstructionPlanningManifestBuilder.ts",
            "ConstructionPlanningManifestTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /\bfunction\s+(select|discover|resolve|load|lookup|bind|schedule|analyzeDependencies|planConstruction|optimize|traverse)\b/
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

    test("references Chapter 28 ConstructionPlanningSpecification without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(SRC_DIR, "ConstructionPlanningManifestTypes.ts"),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_planning_specification\/ConstructionPlanningSpecification["']/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningSpecification\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlanningDefinition\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+(interface|class)\s+ConstructionPlan\b/
        );
    });

    test("builder instances are independent", () => {
        const specificationA = sampleSpecification();
        const planB = new ConstructionPlanBuilder()
            .withPlanId("plan-b")
            .withMetadata(PLAN_META)
            .addReference(Object.freeze({ definitionReferenceId: "def-b" }))
            .build();
        const contractB = new ConstructionPlanningContractBuilder()
            .withContractId("cpc-b")
            .withMetadata(CONTRACT_META)
            .withConstructionPlan(planB)
            .build();
        const definitionB = new ConstructionPlanningDefinitionBuilder()
            .withDefinitionId("cpd-b")
            .withMetadata(DEF_META)
            .withConstructionPlanningContract(contractB)
            .build();
        const specificationB = new ConstructionPlanningSpecificationBuilder()
            .withSpecificationId("cps-b")
            .withMetadata(SPEC_META)
            .withConstructionPlanningDefinition(definitionB)
            .build();

        const a = new ConstructionPlanningManifestBuilder()
            .withManifestId("a")
            .withMetadata(META)
            .withConstructionPlanningSpecification(specificationA)
            .build();
        const b = new ConstructionPlanningManifestBuilder()
            .withManifestId("b")
            .withMetadata(META)
            .withConstructionPlanningSpecification(specificationB)
            .build();

        expect(a.manifestId).toBe("a");
        expect(b.manifestId).toBe("b");
        expect(
            a.contents.constructionPlanningSpecification.specificationId
        ).toBe("cps-ok");
        expect(
            b.contents.constructionPlanningSpecification.specificationId
        ).toBe("cps-b");
    });
});
