import { DefaultAdapter } from "../../src/runtime_execution/Adapter";

/**
 * RB-ADP-001 Adapter は External Runtime の安全な投影を提供する
 * Mapping: Section 5.2 Requirements
 */
describe("RB-ADP-001", () => {
    test("RB-ADP-001", () => {
        const external = { source: "runtime", n: 7 };
        const adapter = new DefaultAdapter(external);
        const projected = adapter.project();

        expect(projected).toEqual(external);
        expect(projected).not.toBe(external);
        expect(Object.isFrozen(projected)).toBe(true);
    });
});
