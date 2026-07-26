import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * RB-ENG-007 Engine は External Runtime を変更しない
 * Mapping: Section 4.2 Requirements
 */
describe("RB-ENG-007", () => {
    test("RB-ENG-007", () => {
        const external = { balance: 100, status: "ready" };
        const snapshot = { ...external };
        const context = new DefaultExecutionContext(external, {});
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "rb-eng-007",
            payload: { mutate: true },
            metadata: {},
        };

        const result = engine.execute(context, input);

        expect(result).toBe(context);
        expect(external).toEqual(snapshot);
        expect(context.runtimeState).toEqual(snapshot);
        expect(() => {
            (context.runtimeState as { balance?: number }).balance = 0;
        }).toThrow();
        expect(external).toEqual(snapshot);
    });
});
