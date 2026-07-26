import { Adapter, DefaultAdapter } from "../../src/runtime_execution/Adapter";
import { ExternalRuntimeState } from "../../src/runtime_execution/types";

/**
 * RB-ADP-004 Adapter は Execution Layer と External Runtime の接続契約を提供する
 * Mapping: Section 5.2 Requirements
 */
describe("RB-ADP-004", () => {
    test("RB-ADP-004", () => {
        const external: ExternalRuntimeState = { bridge: true };
        const adapter: Adapter = new DefaultAdapter(external);

        expect(adapter).toBeInstanceOf(DefaultAdapter);
        expect(typeof (adapter as DefaultAdapter).project).toBe("function");

        const projected = (adapter as DefaultAdapter).project();
        expect(projected).toEqual(external);
        expect(Object.isFrozen(projected)).toBe(true);
    });
});
