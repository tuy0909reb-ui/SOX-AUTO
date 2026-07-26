import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";

/**
 * RB-CTX-001 Context は External Runtime を read-only として扱う
 * Mapping: Section 3.2 Requirements
 */
describe("RB-CTX-001", () => {
    test("RB-CTX-001", () => {
        const external = { mode: "live", seq: 1 };
        const context = new DefaultExecutionContext(external, {});

        expect(Object.isFrozen(context.runtimeState)).toBe(true);
        expect(() => {
            (context.runtimeState as { mode?: string }).mode = "mutated";
        }).toThrow();
        expect(context.runtimeState).toEqual({ mode: "live", seq: 1 });
    });
});
