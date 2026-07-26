import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * DET-001 同一入力・同一 Context・同一 External Runtime 状態 → 同一結果を返す
 * Mapping: Section 6 Determinism Model
 */
describe("DET-001", () => {
    test("DET-001", () => {
        const external = { seed: 42, mode: "det" };
        const context = new DefaultExecutionContext(external, { tick: 0 });
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "det-001",
            payload: { x: 1 },
            metadata: { run: "a" },
        };

        const first = engine.execute(context, input);
        const second = engine.execute(context, input);

        expect(first).toBe(second);
        expect(first).toBe(context);
        expect(context.runtimeState).toEqual(external);
    });
});
