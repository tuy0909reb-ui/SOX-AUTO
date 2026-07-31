import * as fs from "fs";
import * as path from "path";
import type { SelectedReference } from "../../src/construction_selection/ConstructionSelectionTypes";
import { ConstructionPlan } from "../../src/construction_plan/ConstructionPlan";
import { ConstructionPlanBuilder } from "../../src/construction_plan/ConstructionPlanBuilder";
import type { ConstructionPlanMetadata } from "../../src/construction_plan/ConstructionPlanTypes";

const META: ConstructionPlanMetadata = Object.freeze({
    identifier: "plan-builder",
    name: "Builder Test Plan",
    version: "0.3",
});

const REF: SelectedReference = Object.freeze({
    definitionReferenceId: "def-1",
});

const SRC_DIR = path.resolve(__dirname, "../../src/construction_plan");

describe("ASA-ARCH-25.0 — ConstructionPlanBuilder", () => {
    test("builder constructs immutable instances with structural validation only", () => {
        const plan = new ConstructionPlanBuilder()
            .withPlanId("plan-ok")
            .withMetadata(META)
            .addReference(REF)
            .build();

        expect(plan).toBeInstanceOf(ConstructionPlan);
        expect(Object.isFrozen(plan)).toBe(true);
        expect(plan.contents[0].definitionReferenceId).toBe("def-1");
    });

    test("structural validation rejects missing planId", () => {
        expect(() =>
            new ConstructionPlanBuilder()
                .withMetadata(META)
                .addReference(REF)
                .build()
        ).toThrow(/planId is required/);
    });

    test("structural validation rejects missing metadata", () => {
        expect(() =>
            new ConstructionPlanBuilder()
                .withPlanId("plan-1")
                .addReference(REF)
                .build()
        ).toThrow(/metadata is required/);
    });

    test("structural validation rejects empty contents", () => {
        expect(() =>
            new ConstructionPlanBuilder()
                .withPlanId("plan-1")
                .withMetadata(META)
                .build()
        ).toThrow(/contents must be non-empty/);
    });

    test("structural validation rejects empty definitionReferenceId", () => {
        expect(() =>
            new ConstructionPlanBuilder()
                .withPlanId("plan-1")
                .withMetadata(META)
                .addReference(
                    Object.freeze({ definitionReferenceId: "   " })
                )
                .build()
        ).toThrow(/definitionReferenceId is required/);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ConstructionPlan.ts",
            "ConstructionPlanBuilder.ts",
            "ConstructionPlanTypes.ts",
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

    test("reuses Chapter 23 SelectedReference without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(SRC_DIR, "ConstructionPlanTypes.ts"),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_selection\/ConstructionSelectionTypes["']/
        );
        expect(typesBody).toMatch(
            /export\s+type\s+ConstructionPlanReference\s*=\s*SelectedReference/
        );
        expect(typesBody).not.toMatch(
            /export\s+interface\s+SelectedReference\b/
        );
        expect(typesBody).not.toMatch(
            /export\s+interface\s+ConstructionPlanReference\b/
        );
    });

    test("does not redefine or mutate Construction Selection Result contracts", () => {
        const files = [
            "ConstructionPlan.ts",
            "ConstructionPlanBuilder.ts",
            "ConstructionPlanTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /export\s+(interface|class|type)\s+ConstructionSelectionResult\b/
            );
            expect(body).not.toMatch(
                /export\s+(interface|class|type)\s+SelectedReference\b/
            );
        }
    });

    test("builder instances are independent and preserve order", () => {
        const a = new ConstructionPlanBuilder()
            .withPlanId("a")
            .withMetadata(META)
            .withContents([
                Object.freeze({ definitionReferenceId: "def-1" }),
                Object.freeze({ definitionReferenceId: "def-2" }),
            ])
            .build();
        const b = new ConstructionPlanBuilder()
            .withPlanId("b")
            .withMetadata(META)
            .addReference(
                Object.freeze({ definitionReferenceId: "def-b" })
            )
            .build();

        expect(a.planId).toBe("a");
        expect(b.planId).toBe("b");
        expect(a.contents.map((r) => r.definitionReferenceId)).toEqual([
            "def-1",
            "def-2",
        ]);
        expect(b.contents[0].definitionReferenceId).toBe("def-b");
    });
});
