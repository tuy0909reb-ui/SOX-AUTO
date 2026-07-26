import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";

describe("ExecutionEngine basic behavior", () => {
    test("execute returns the same context", () => {
        const runtimeState = {};
        const internalState = {};

        const context = new DefaultExecutionContext(runtimeState, internalState);
        const engine = new DefaultExecutionEngine();

        const result = engine.execute(context, { type: "test", payload: null, metadata: {} });

        expect(result).toBe(context);
    });
});
