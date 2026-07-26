import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * ERR-003 エラー発生時も Pipeline の意味論は保持される
 * Mapping: Section 7 Error Model
 */
describe("ERR-003", () => {
    test("ERR-003", () => {
        const pipelineSteps = ["ingest", "validate", "apply"];
        const snapshotPipeline = [...pipelineSteps];
        const external = { pipelineSteps };
        const context = new DefaultExecutionContext(external, {});
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "err-003",
            payload: { forceErrorPath: true },
            metadata: {},
        };

        engine.execute(context, input);

        let errorSeen = false;
        try {
            (context.runtimeState as { pipelineSteps?: string[] }).pipelineSteps = [];
        } catch {
            errorSeen = true;
        }

        expect(errorSeen).toBe(true);
        expect(pipelineSteps).toEqual(snapshotPipeline);
        expect(external.pipelineSteps).toEqual(snapshotPipeline);
        expect(context.runtimeState).toEqual({ pipelineSteps: snapshotPipeline });
    });
});
