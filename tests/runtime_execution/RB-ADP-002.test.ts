import { DefaultAdapter } from "../../src/runtime_execution/Adapter";

/**
 * RB-ADP-002 Adapter は副作用を持たない
 * Mapping: Section 5.2 Requirements
 */
describe("RB-ADP-002", () => {
    test("RB-ADP-002", () => {
        const external = { counter: 1, label: "ext" };
        const snapshot = { ...external };
        const adapter = new DefaultAdapter(external);

        const first = adapter.project();
        const second = adapter.project();

        expect(external).toEqual(snapshot);
        expect(first).toEqual(snapshot);
        expect(second).toEqual(snapshot);
        expect(() => {
            (first as { counter?: number }).counter = 99;
        }).toThrow();
        expect(external).toEqual(snapshot);
    });
});
