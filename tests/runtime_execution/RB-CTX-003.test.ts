import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * RB-CTX-003 Context の状態遷移は仕様に従う
 * Mapping: Section 3.2 Requirements
 */
describe("RB-CTX-003", () => {
    test("RB-CTX-003", () => {
        const context = new DefaultExecutionContext({ v: 1 }, { phase: "created" });

        // Spec: Context snapshots External/Internal state as frozen readonly projections.
        expect(Object.isFrozen(context.runtimeState)).toBe(true);
        expect(Object.isFrozen(context.internalState)).toBe(true);

        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "rb-ctx-003",
            payload: { next: "ignored-by-skeleton" },
            metadata: {},
        };

        // Spec/skeleton transition: execute returns the same context instance (no alternate state object).
        const after = engine.execute(context, input);
        expect(after).toBe(context);
        expect((after as DefaultExecutionContext).runtimeState).toBe(context.runtimeState);
        expect((after as DefaultExecutionContext).internalState).toBe(context.internalState);
    });
});
