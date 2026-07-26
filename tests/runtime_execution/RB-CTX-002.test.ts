import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * RB-CTX-002 Context は意味論的同値性を保持する
 * Mapping: Section 3.2 Requirements
 */
describe("RB-CTX-002", () => {
    test("RB-CTX-002", () => {
        const external = { symbol: "SOXX", ready: true };
        const internal = { cursor: 0 };
        const context = new DefaultExecutionContext(external, internal);
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "rb-ctx-002",
            payload: null,
            metadata: {},
        };

        const runtimeBefore = { ...context.runtimeState };
        const internalBefore = { ...context.internalState };
        const result = engine.execute(context, input);

        expect(result).toBe(context);
        expect(context.runtimeState).toEqual(runtimeBefore);
        expect(context.internalState).toEqual(internalBefore);
        expect(context.runtimeState).toEqual(external);
    });
});
