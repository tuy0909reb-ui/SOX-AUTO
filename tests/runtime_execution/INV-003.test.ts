import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultAdapter } from "../../src/runtime_execution/Adapter";

/**
 * INV-003 External Runtime は read-only である
 * Mapping: Section 3.2 Requirements
 */
describe("INV-003", () => {
    test("INV-003", () => {
        const external = { value: 1 };
        const context = new DefaultExecutionContext(external, {});
        const adapter = new DefaultAdapter(external);

        expect(Object.isFrozen(context.runtimeState)).toBe(true);
        expect(() => {
            (context.runtimeState as { value?: number }).value = 2;
        }).toThrow();

        const projected = adapter.project();
        expect(Object.isFrozen(projected)).toBe(true);
        expect(() => {
            (projected as { value?: number }).value = 3;
        }).toThrow();

        // Original external object is not rewritten by Context construction snapshotting.
        expect(external).toEqual({ value: 1 });
    });
});
