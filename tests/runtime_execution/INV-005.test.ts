import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * INV-005 Runtime の決定性を保持する
 * Mapping: Section 6 Determinism Model
 */
describe("INV-005", () => {
    test("INV-005", () => {
        const context = new DefaultExecutionContext({ mark: "a" }, { n: 1 });
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "inv-005",
            payload: { x: 1 },
            metadata: { k: "v" },
        };

        const first = engine.execute(context, input);
        const second = engine.execute(context, input);

        expect(first).toBe(second);
        expect(first).toBe(context);
    });
});
