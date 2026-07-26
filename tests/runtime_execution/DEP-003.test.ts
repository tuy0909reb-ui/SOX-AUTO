import { DefaultAdapter } from "../../src/runtime_execution/Adapter";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * DEP-003 20.8 は既存 Runtime の内部状態に書き込まない
 * Mapping: Section 3.2 Requirements
 */
describe("DEP-003", () => {
    test("DEP-003", () => {
        const external = { nested: { count: 1 }, flag: true };
        const snapshot = JSON.parse(JSON.stringify(external));

        const context = new DefaultExecutionContext(external, { phase: "init" });
        const adapter = new DefaultAdapter(external);
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "dep-003",
            payload: { attempt: "write" },
            metadata: {},
        };

        const projected = adapter.project();
        engine.execute(context, input);

        // Projection / context freeze must not write through to External Runtime state.
        expect(external).toEqual(snapshot);
        expect(() => {
            (context.runtimeState as { flag?: boolean }).flag = false;
        }).toThrow();
        expect(() => {
            (projected as { nested?: { count: number } }).nested = { count: 99 };
        }).toThrow();
        expect(external).toEqual(snapshot);
    });
});
