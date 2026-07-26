import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine, ExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * RB-ENG-001 Engine は Execution Layer の実行を担う
 * Mapping: Section 4.2 Requirements
 */
describe("RB-ENG-001", () => {
    test("RB-ENG-001", () => {
        const engine: ExecutionEngine = new DefaultExecutionEngine();
        const context = new DefaultExecutionContext({}, {});
        const input: ExecutionLayerInput = {
            type: "rb-eng-001",
            payload: null,
            metadata: {},
        };

        expect(typeof engine.execute).toBe("function");
        const result = engine.execute(context, input);
        expect(result).toBe(context);
    });
});
