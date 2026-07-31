import type { SelectedReference } from "../../src/construction_selection/ConstructionSelectionTypes";
import { ConstructionPlan } from "../../src/construction_plan/ConstructionPlan";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import type { ConstructionPlanMetadata } from "../../src/construction_plan/ConstructionPlanTypes";

const META: ConstructionPlanMetadata = Object.freeze({
    identifier: "construction.plan.pipeline.v1",
    name: "Pipeline Construction Plan",
    version: "0.3",
    description: "Declarative plan from Construction Selection Result",
});

const REF_A: SelectedReference = Object.freeze({
    definitionReferenceId: "definition.ref.a",
});
const REF_B: SelectedReference = Object.freeze({
    definitionReferenceId: "definition.ref.b",
});

describe("ASA-ARCH-25.0 — ConstructionPlan", () => {
    test("immutable plan with identity, metadata, and Selection Result references", () => {
        const plan = new ConstructionPlanBuilder()
            .withPlanId("construction.plan.pipeline.v1")
            .withMetadata(META)
            .addReference(REF_A)
            .addReference(REF_B)
            .build();

        expect(plan).toBeInstanceOf(ConstructionPlan);
        expect(Object.isFrozen(plan)).toBe(true);
        expect(Object.isFrozen(plan.contents)).toBe(true);
        expect(Object.isFrozen(plan.metadata)).toBe(true);
        expect(plan.planId).toBe("construction.plan.pipeline.v1");
        expect(plan.contents).toHaveLength(2);
        expect(plan.contents[0].definitionReferenceId).toBe(
            "definition.ref.a"
        );
        expect(plan.contents[1].definitionReferenceId).toBe(
            "definition.ref.b"
        );
        expect(Object.keys(plan).sort()).toEqual([
            "contents",
            "metadata",
            "planId",
        ]);
        expect(plan).not.toHaveProperty("runtime");
        expect(plan).not.toHaveProperty("planning");
        expect(plan).not.toHaveProperty("scheduler");
        expect(plan).not.toHaveProperty("algorithm");
    });

    test("contents preserve SelectedReference shape and caller order", () => {
        const plan = new ConstructionPlanBuilder()
            .withPlanId("plan-1")
            .withMetadata(META)
            .withContents([REF_B, REF_A])
            .build();

        expect(plan.contents[0].definitionReferenceId).toBe(
            "definition.ref.b"
        );
        expect(plan.contents[1].definitionReferenceId).toBe(
            "definition.ref.a"
        );
        const ref = plan.contents[0];
        expect(Object.isFrozen(ref)).toBe(true);
        expect(Object.keys(ref)).toEqual(["definitionReferenceId"]);
        expect(ref).not.toHaveProperty("resolved");
        expect(ref).not.toHaveProperty("path");
        expect(ref).not.toHaveProperty("executable");
    });

    test("runtime isolation — no runtime fields on plan model", () => {
        const plan = new ConstructionPlanBuilder()
            .withPlanId("plan-rt")
            .withMetadata(META)
            .addReference(REF_A)
            .build();

        const serialized = JSON.stringify(plan);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
        expect(serialized).not.toMatch(/planner/i);
    });
});
