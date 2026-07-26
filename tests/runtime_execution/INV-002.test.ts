import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * INV-002 既存 Runtime の意味論を変更しない
 * Mapping: Section 1 Overview
 */
describe("INV-002", () => {
    test("INV-002", () => {
        const runtimeState = { token: "external" };
        const internalState = { step: 0 };
        const context = new DefaultExecutionContext(runtimeState, internalState);
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "inv-002",
            payload: null,
            metadata: {},
        };

        const frozenRuntimeBefore = context.runtimeState;
        const result = engine.execute(context, input);

        // Execution does not replace or rewrite External Runtime semantics:
        // same context is returned; runtime projection remains the frozen snapshot.
        expect(result).toBe(context);
        expect(context.runtimeState).toBe(frozenRuntimeBefore);
        expect(context.runtimeState).toEqual({ token: "external" });
        expect(runtimeState).toEqual({ token: "external" });
    });
});
