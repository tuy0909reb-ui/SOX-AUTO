import type { SelectedReference } from "../../src/construction_selection/ConstructionSelectionTypes";
import { ConstructionSelectionResult } from "../../src/construction_selection_result/ConstructionSelectionResult";
import { ConstructionSelectionResultBuilder } from "../../src/construction_selection_result/ConstructionSelectionResultBuilder";
import { ResultMetadata } from "../../src/construction_selection_result/ConstructionSelectionResultTypes";

const META: ResultMetadata = Object.freeze({
    identifier: "construction.selection.result.pipeline.v1",
    name: "Pipeline Construction Selection Result",
    version: "1.1",
    ownership: "ASA-ARCH-24.0",
    compatibilityInformation: "ASA-ARCH-23.0-SelectedReferences",
});

const REF_A: SelectedReference = Object.freeze({
    definitionReferenceId: "definition.ref.a",
});
const REF_B: SelectedReference = Object.freeze({
    definitionReferenceId: "definition.ref.b",
});

describe("ASA-ARCH-24.0 — ConstructionSelectionResult", () => {
    test("CSR-1 / CSR-3 — immutable result with Chapter 23 SelectedReference contents only", () => {
        const result = new ConstructionSelectionResultBuilder()
            .withResultId("construction.selection.result.pipeline.v1")
            .withMetadata(META)
            .addSelectedReference(REF_A)
            .addSelectedReference(REF_B)
            .build();

        expect(result).toBeInstanceOf(ConstructionSelectionResult);
        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(result.contents)).toBe(true);
        expect(Object.isFrozen(result.metadata)).toBe(true);
        expect(result.resultId).toBe(
            "construction.selection.result.pipeline.v1"
        );
        expect(result.contents).toHaveLength(2);
        expect(result.contents[0].definitionReferenceId).toBe(
            "definition.ref.a"
        );
        expect(Object.keys(result).sort()).toEqual([
            "compatibility",
            "contents",
            "integrity",
            "metadata",
            "resultId",
        ]);
        expect(result).not.toHaveProperty("runtime");
        expect(result).not.toHaveProperty("selection");
        expect(result).not.toHaveProperty("discovery");
        expect(result).not.toHaveProperty("algorithm");
    });

    test("Result contents preserve SelectedReference shape without duplication of definition contents", () => {
        const result = new ConstructionSelectionResultBuilder()
            .withResultId("res-1")
            .withMetadata(META)
            .withContents([REF_A])
            .build();

        const ref = result.contents[0];
        expect(Object.isFrozen(ref)).toBe(true);
        expect(Object.keys(ref)).toEqual(["definitionReferenceId"]);
        expect(ref).not.toHaveProperty("contents");
        expect(ref).not.toHaveProperty("resolved");
        expect(ref).not.toHaveProperty("path");
    });

    test("CSR ownership — Selected References remain Chapter 23 owned", () => {
        const result = new ConstructionSelectionResultBuilder()
            .withResultId("res-own")
            .withMetadata(META)
            .addSelectedReference(REF_A)
            .build();

        expect(result.metadata.ownership).toBe("ASA-ARCH-24.0");
        expect(result.integrity.requiresValidSelectedReferences).toBe(true);
        expect(
            result.compatibility.preservesSelectedReferenceCompatibility
        ).toBe(true);
    });

    test("runtime isolation — no runtime fields on result model", () => {
        const result = new ConstructionSelectionResultBuilder()
            .withResultId("res-rt")
            .withMetadata(META)
            .addSelectedReference(REF_A)
            .build();

        const serialized = JSON.stringify(result);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
    });
});
