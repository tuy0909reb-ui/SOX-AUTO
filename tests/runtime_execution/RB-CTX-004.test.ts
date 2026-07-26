import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * RB-CTX-004 Context は External Runtime を変更しない
 * Mapping: Section 3.2 Requirements
 */
describe("RB-CTX-004", () => {
    test("RB-CTX-004", () => {
        const external = { held: ["A", "B"], open: true };
        const snapshot = JSON.parse(JSON.stringify(external));
        const context = new DefaultExecutionContext(external, {});
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "rb-ctx-004",
            payload: { write: true },
            metadata: {},
        };

        engine.execute(context, input);

        expect(external).toEqual(snapshot);
        expect(() => {
            (context.runtimeState as { open?: boolean }).open = false;
        }).toThrow();
        expect(external).toEqual(snapshot);
    });
});
