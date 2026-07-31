import { ConstructionSelection } from "../../src/construction_selection/ConstructionSelection";
import { ConstructionSelectionBuilder } from "../../src/construction_selection/ConstructionSelectionBuilder";
import {
    SelectedReference,
    SelectionMetadata,
} from "../../src/construction_selection/ConstructionSelectionTypes";

const META: SelectionMetadata = Object.freeze({
    identifier: "construction.selection.pipeline.v1",
    name: "Pipeline Construction Selection",
    version: "1.4",
    ownership: "ASA-ARCH-23.0",
    compatibilityInformation: "ASA-ARCH-21.3-Ch11-Ch22",
});

describe("ASA-ARCH-23.0 — ConstructionSelection", () => {
    test("REQ-23-1 / REQ-23-3 — ConstructionSelection is immutable and declarative-only", () => {
        const selection = new ConstructionSelectionBuilder()
            .withSelectionId("construction.selection.pipeline.v1")
            .withDiscoveryResultReference("discovery.result.pipeline.v1")
            .addSelectedReference("definition.ref.a")
            .addSelectedReference("definition.ref.b")
            .withMetadata(META)
            .build();

        expect(selection).toBeInstanceOf(ConstructionSelection);
        expect(Object.isFrozen(selection)).toBe(true);
        expect(Object.isFrozen(selection.selectedReferences)).toBe(true);
        expect(Object.isFrozen(selection.metadata)).toBe(true);
        expect(Object.isFrozen(selection.discoveryResultReference)).toBe(true);
        expect(selection.selectionId).toBe("construction.selection.pipeline.v1");
        expect(selection.discoveryResultReference.discoveryResultId).toBe(
            "discovery.result.pipeline.v1"
        );
        expect(selection.selectedReferences).toHaveLength(2);
        expect(Object.keys(selection).sort()).toEqual([
            "compatibility",
            "discoveryResultReference",
            "integrity",
            "metadata",
            "selectedReferences",
            "selectionId",
        ]);
        expect(selection).not.toHaveProperty("runtime");
        expect(selection).not.toHaveProperty("registry");
        expect(selection).not.toHaveProperty("algorithm");
        expect(selection).not.toHaveProperty("service");
    });

    test("REQ-23-2 / REQ-23-4 — SelectedReference is immutable declarative reference only", () => {
        const selection = new ConstructionSelectionBuilder()
            .withSelectionId("sel-1")
            .withDiscoveryResultReference("dr-1")
            .addSelectedReference("def-ref-1")
            .withMetadata(META)
            .build();

        const ref: SelectedReference = selection.selectedReferences[0];
        expect(Object.isFrozen(ref)).toBe(true);
        expect(Object.keys(ref)).toEqual(["definitionReferenceId"]);
        expect(ref.definitionReferenceId).toBe("def-ref-1");
        expect(ref).not.toHaveProperty("contents");
        expect(ref).not.toHaveProperty("resolved");
        expect(ref).not.toHaveProperty("path");
        expect(ref).not.toHaveProperty("loader");
    });

    test("CSE ownership — does not transfer ownership of referenced elements", () => {
        const selection = new ConstructionSelectionBuilder()
            .withSelectionId("sel-own")
            .withDiscoveryResultReference("dr-own")
            .addSelectedReference("def-ref-own")
            .withMetadata(META)
            .build();

        expect(selection.integrity.requiresValidSelectedReferences).toBe(true);
        expect(selection.compatibility.preservesSelectedReferenceValidity).toBe(
            true
        );
        expect(selection.metadata.ownership).toBe("ASA-ARCH-23.0");
    });

    test("runtime isolation — no runtime fields on selection model", () => {
        const selection = new ConstructionSelectionBuilder()
            .withSelectionId("sel-rt")
            .withDiscoveryResultReference("dr-rt")
            .withMetadata(META)
            .build();

        const serialized = JSON.stringify(selection);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/lifecycle/i);
    });
});
