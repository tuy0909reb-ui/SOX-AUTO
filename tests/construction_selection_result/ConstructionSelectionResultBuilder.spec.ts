import * as fs from "fs";
import * as path from "path";
import type { SelectedReference } from "../../src/construction_selection/ConstructionSelectionTypes";
import { ConstructionSelectionResult } from "../../src/construction_selection_result/ConstructionSelectionResult";
import { ConstructionSelectionResultBuilder } from "../../src/construction_selection_result/ConstructionSelectionResultBuilder";
import { ResultMetadata } from "../../src/construction_selection_result/ConstructionSelectionResultTypes";

const META: ResultMetadata = Object.freeze({
    identifier: "res-builder",
    name: "Builder Test Result",
    version: "1.1",
    ownership: "ASA-ARCH-24.0",
    compatibilityInformation: "test",
});

const REF: SelectedReference = Object.freeze({
    definitionReferenceId: "def-1",
});

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/construction_selection_result"
);

describe("ASA-ARCH-24.0 — ConstructionSelectionResultBuilder", () => {
    test("builder constructs immutable instances with structural validation only", () => {
        const result = new ConstructionSelectionResultBuilder()
            .withResultId("res-ok")
            .withMetadata(META)
            .addSelectedReference(REF)
            .build();

        expect(result).toBeInstanceOf(ConstructionSelectionResult);
        expect(Object.isFrozen(result)).toBe(true);
        expect(result.contents[0].definitionReferenceId).toBe("def-1");
    });

    test("structural validation rejects missing resultId", () => {
        expect(() =>
            new ConstructionSelectionResultBuilder()
                .withMetadata(META)
                .addSelectedReference(REF)
                .build()
        ).toThrow(/resultId is required/);
    });

    test("structural validation rejects missing metadata", () => {
        expect(() =>
            new ConstructionSelectionResultBuilder()
                .withResultId("res-1")
                .addSelectedReference(REF)
                .build()
        ).toThrow(/metadata is required/);
    });

    test("structural validation rejects empty contents", () => {
        expect(() =>
            new ConstructionSelectionResultBuilder()
                .withResultId("res-1")
                .withMetadata(META)
                .build()
        ).toThrow(/contents must be non-empty/);
    });

    test("structural validation rejects empty definitionReferenceId", () => {
        expect(() =>
            new ConstructionSelectionResultBuilder()
                .withResultId("res-1")
                .withMetadata(META)
                .addSelectedReference(
                    Object.freeze({ definitionReferenceId: "   " })
                )
                .build()
        ).toThrow(/definitionReferenceId is required/);
    });

    test("no prohibited behavioral / runtime / discovery / selection APIs", () => {
        const files = [
            "ConstructionSelectionResult.ts",
            "ConstructionSelectionResultBuilder.ts",
            "ConstructionSelectionResultTypes.ts",
            "index.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /\bfunction\s+(select|discover|resolve|load|lookup|bind|schedule|analyzeDependencies|planConstruction)\b/
            );
            expect(body).not.toMatch(
                /\bclass\s+(SelectionService|DiscoveryService|RegistryService|ResultService|Scheduler|Dispatcher)\b/
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

    test("consumes Chapter 23 SelectedReference type without redefining it", () => {
        const typesBody = fs.readFileSync(
            path.join(SRC_DIR, "ConstructionSelectionResultTypes.ts"),
            "utf8"
        );
        expect(typesBody).toMatch(
            /from\s+["']\.\.\/construction_selection\/ConstructionSelectionTypes["']/
        );
        expect(typesBody).not.toMatch(
            /export\s+interface\s+SelectedReference\b/
        );
    });

    test("builder instances are independent", () => {
        const a = new ConstructionSelectionResultBuilder()
            .withResultId("a")
            .withMetadata(META)
            .addSelectedReference(REF)
            .build();
        const b = new ConstructionSelectionResultBuilder()
            .withResultId("b")
            .withMetadata(META)
            .addSelectedReference(
                Object.freeze({ definitionReferenceId: "def-b" })
            )
            .build();

        expect(a.resultId).toBe("a");
        expect(b.resultId).toBe("b");
        expect(a.contents[0].definitionReferenceId).toBe("def-1");
        expect(b.contents[0].definitionReferenceId).toBe("def-b");
    });
});
