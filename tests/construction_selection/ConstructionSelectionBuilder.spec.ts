import * as fs from "fs";
import * as path from "path";
import { ConstructionSelection } from "../../src/construction_selection/ConstructionSelection";
import { ConstructionSelectionBuilder } from "../../src/construction_selection/ConstructionSelectionBuilder";
import { SelectionMetadata } from "../../src/construction_selection/ConstructionSelectionTypes";

const META: SelectionMetadata = Object.freeze({
    identifier: "sel-builder",
    name: "Builder Test Selection",
    version: "1.4",
    ownership: "ASA-ARCH-23.0",
    compatibilityInformation: "test",
});

const SRC_DIR = path.resolve(__dirname, "../../src/construction_selection");

describe("ASA-ARCH-23.0 — ConstructionSelectionBuilder", () => {
    test("REQ-23-5 / REQ-23-6 — builder constructs immutable instances with structural validation only", () => {
        const selection = new ConstructionSelectionBuilder()
            .withSelectionId("sel-ok")
            .withDiscoveryResultReference("dr-ok")
            .addSelectedReference("def-1")
            .withMetadata(META)
            .build();

        expect(selection).toBeInstanceOf(ConstructionSelection);
        expect(Object.isFrozen(selection)).toBe(true);
        expect(selection.selectedReferences[0].definitionReferenceId).toBe(
            "def-1"
        );
    });

    test("structural validation rejects missing selectionId", () => {
        expect(() =>
            new ConstructionSelectionBuilder()
                .withDiscoveryResultReference("dr-1")
                .withMetadata(META)
                .build()
        ).toThrow(/selectionId is required/);
    });

    test("structural validation rejects missing discovery result reference", () => {
        expect(() =>
            new ConstructionSelectionBuilder()
                .withSelectionId("sel-1")
                .withMetadata(META)
                .build()
        ).toThrow(/discoveryResultReference\.discoveryResultId is required/);
    });

    test("structural validation rejects missing metadata", () => {
        expect(() =>
            new ConstructionSelectionBuilder()
                .withSelectionId("sel-1")
                .withDiscoveryResultReference("dr-1")
                .build()
        ).toThrow(/metadata is required/);
    });

    test("structural validation rejects empty selected reference id", () => {
        expect(() =>
            new ConstructionSelectionBuilder()
                .withSelectionId("sel-1")
                .withDiscoveryResultReference("dr-1")
                .addSelectedReference("   ")
                .withMetadata(META)
                .build()
        ).toThrow(/definitionReferenceId is required/);
    });

    test("REQ-23-7…REQ-23-19 — no prohibited behavioral / runtime / registry / discovery APIs", () => {
        const files = [
            "ConstructionSelection.ts",
            "ConstructionSelectionBuilder.ts",
            "ConstructionSelectionTypes.ts",
            "index.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /\bfunction\s+(select|discover|resolve|load|lookup|schedule|analyzeDependencies|planConstruction|traverseCatalog)\b/
            );
            expect(body).not.toMatch(
                /\bclass\s+(SelectionService|DiscoveryService|RegistryService|Scheduler|Dispatcher)\b/
            );
            expect(body).not.toMatch(/from\s+["'].*runtime_execution/);
            expect(body).not.toMatch(/from\s+["'].*orchestration/);
            expect(body).not.toMatch(
                /from\s+["'].*contracts\/construction\/(ConstructionRegistry|ConstructionCatalog|ConstructionDiscovery)/
            );
            expect(body).not.toMatch(/\basync\b/);
            expect(body).not.toMatch(/\bfetch\b|\bhttp\b/);
            expect(body).not.toMatch(/getInstance\s*\(/);
            expect(body).not.toMatch(/service\s*locator/i);
            expect(body).not.toMatch(/injectable|inversify|tsyringe/i);
        }
    });

    test("builder instances are independent — no shared global selection state", () => {
        const a = new ConstructionSelectionBuilder()
            .withSelectionId("a")
            .withDiscoveryResultReference("dr-a")
            .addSelectedReference("def-a")
            .withMetadata(META)
            .build();
        const b = new ConstructionSelectionBuilder()
            .withSelectionId("b")
            .withDiscoveryResultReference("dr-b")
            .withMetadata(META)
            .build();

        expect(a.selectionId).toBe("a");
        expect(b.selectionId).toBe("b");
        expect(a.selectedReferences).toHaveLength(1);
        expect(b.selectedReferences).toHaveLength(0);
    });
});
