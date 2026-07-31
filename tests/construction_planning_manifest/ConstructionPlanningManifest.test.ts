import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import { ConstructionPlanningContractBuilder } from "../../src/construction_planning_contract/ConstructionPlanningContractBuilder";
import { ConstructionPlanningDefinitionBuilder } from "../../src/construction_planning_definition/ConstructionPlanningDefinitionBuilder";
import { ConstructionPlanningSpecificationBuilder } from "../../src/construction_planning_specification/ConstructionPlanningSpecificationBuilder";
import { ConstructionPlanningManifest } from "../../src/construction_planning_manifest/ConstructionPlanningManifest";
import { ConstructionPlanningManifestBuilder } from "../../src/construction_planning_manifest/ConstructionPlanningManifestBuilder";
import type { ConstructionPlanningManifestMetadata } from "../../src/construction_planning_manifest/ConstructionPlanningManifestTypes";

const PLAN_META = Object.freeze({
    identifier: "construction.plan.pipeline.v1",
    name: "Pipeline Construction Plan",
    version: "0.3",
});

const CONTRACT_META = Object.freeze({
    identifier: "construction.planning.contract.pipeline.v1",
    name: "Pipeline Construction Planning Contract",
    version: "0.4",
});

const DEF_META = Object.freeze({
    identifier: "construction.planning.definition.pipeline.v1",
    name: "Pipeline Construction Planning Definition",
    version: "0.5",
});

const SPEC_META = Object.freeze({
    identifier: "construction.planning.specification.pipeline.v1",
    name: "Pipeline Construction Planning Specification",
    version: "0.4",
});

const MANIFEST_META: ConstructionPlanningManifestMetadata = Object.freeze({
    identifier: "construction.planning.manifest.pipeline.v1",
    name: "Pipeline Construction Planning Manifest",
    version: "0.3",
    description:
        "Declarative manifest conforming to Construction Planning Specification",
});

function sampleSpecification() {
    const plan = new ConstructionPlanBuilder()
        .withPlanId("construction.plan.pipeline.v1")
        .withMetadata(PLAN_META)
        .withContents([
            Object.freeze({ definitionReferenceId: "definition.ref.a" }),
            Object.freeze({ definitionReferenceId: "definition.ref.b" }),
        ])
        .build();

    const contract = new ConstructionPlanningContractBuilder()
        .withContractId("construction.planning.contract.pipeline.v1")
        .withMetadata(CONTRACT_META)
        .withConstructionPlan(plan)
        .withPermittedConsumers(["ASA-ARCH-29.0"])
        .withPermittedArchitecturalRelationships([
            "ConstructionPlanningSpecification -> ConstructionPlanningManifest",
        ])
        .withDeclarativeUsageConstraints([
            "consume-specification-declaratively-only",
        ])
        .build();

    const definition = new ConstructionPlanningDefinitionBuilder()
        .withDefinitionId("construction.planning.definition.pipeline.v1")
        .withMetadata(DEF_META)
        .withConstructionPlanningContract(contract)
        .build();

    return new ConstructionPlanningSpecificationBuilder()
        .withSpecificationId(
            "construction.planning.specification.pipeline.v1"
        )
        .withMetadata(SPEC_META)
        .withConstructionPlanningDefinition(definition)
        .build();
}

describe("ASA-ARCH-29.0 — ConstructionPlanningManifest", () => {
    test("immutable manifest with identity, metadata, and preserved specification", () => {
        const specification = sampleSpecification();
        const manifest = new ConstructionPlanningManifestBuilder()
            .withManifestId("construction.planning.manifest.pipeline.v1")
            .withMetadata(MANIFEST_META)
            .withConstructionPlanningSpecification(specification)
            .build();

        expect(manifest).toBeInstanceOf(ConstructionPlanningManifest);
        expect(Object.isFrozen(manifest)).toBe(true);
        expect(Object.isFrozen(manifest.metadata)).toBe(true);
        expect(Object.isFrozen(manifest.contents)).toBe(true);
        expect(manifest.manifestId).toBe(
            "construction.planning.manifest.pipeline.v1"
        );
        expect(manifest.metadata).toEqual(MANIFEST_META);
        expect(manifest.contents.constructionPlanningSpecification).toBe(
            specification
        );
        expect(Object.keys(manifest).sort()).toEqual([
            "contents",
            "manifestId",
            "metadata",
        ]);
        expect(manifest).not.toHaveProperty("runtime");
        expect(manifest).not.toHaveProperty("planning");
        expect(manifest).not.toHaveProperty("scheduler");
        expect(manifest).not.toHaveProperty("algorithm");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const manifest = new ConstructionPlanningManifestBuilder()
            .withManifestId("cpm-serialize")
            .withMetadata(MANIFEST_META)
            .withConstructionPlanningSpecification(sampleSpecification())
            .build();

        const serialized = JSON.stringify(manifest);
        const parsed = JSON.parse(serialized);

        expect(parsed.manifestId).toBe("cpm-serialize");
        expect(parsed.metadata.identifier).toBe(MANIFEST_META.identifier);
        expect(
            parsed.contents.constructionPlanningSpecification.specificationId
        ).toBe("construction.planning.specification.pipeline.v1");
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/planner/i);
    });

    test("deterministic construction — same inputs yield equal declarative shape", () => {
        const specification = sampleSpecification();
        const a = new ConstructionPlanningManifestBuilder()
            .withManifestId("cpm-det")
            .withMetadata(MANIFEST_META)
            .withConstructionPlanningSpecification(specification)
            .build();
        const b = new ConstructionPlanningManifestBuilder()
            .withManifestId("cpm-det")
            .withMetadata(MANIFEST_META)
            .withConstructionPlanningSpecification(specification)
            .build();

        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(a.contents.constructionPlanningSpecification).toBe(
            b.contents.constructionPlanningSpecification
        );
    });
});
