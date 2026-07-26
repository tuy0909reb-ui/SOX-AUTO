import { DefaultAdapter } from "../../src/runtime_execution/Adapter";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * ERR-002 エラーは External Runtime に伝播しない
 * Mapping: Section 7 Error Model
 */
describe("ERR-002", () => {
    test("ERR-002", () => {
        const external = { healthy: true, value: 10 };
        const snapshot = { ...external };
        const context = new DefaultExecutionContext(external, {});
        const adapter = new DefaultAdapter(external);
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "err-002",
            payload: null,
            metadata: {},
        };

        engine.execute(context, input);

        let caught: unknown;
        try {
            (context.runtimeState as { healthy?: boolean }).healthy = false;
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeInstanceOf(TypeError);
        expect(external).toEqual(snapshot);

        const projected = adapter.project();
        expect(() => {
            (projected as { value?: number }).value = -1;
        }).toThrow(TypeError);
        expect(external).toEqual(snapshot);
    });
});
