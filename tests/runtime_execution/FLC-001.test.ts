import * as fs from "fs";
import * as path from "path";
import {
    DefaultExecutionEngine,
    ExecutionEngine,
} from "../../src/runtime_execution/ExecutionEngine";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * FLC-001 Execution Engine の論理契約は凍結される
 * Mapping: Section 9 Frozen Items
 */
describe("FLC-001", () => {
    test("FLC-001", () => {
        const baselinePath = path.resolve(__dirname, "../../docs/baselines/ASA-ARCH-20.8.md");
        const baseline = fs.readFileSync(baselinePath, "utf8");
        expect(baseline).toMatch(/FLC-001 Execution Engine の論理契約は凍結される/);

        const engine: ExecutionEngine = new DefaultExecutionEngine();
        expect(typeof engine.execute).toBe("function");

        const context = new DefaultExecutionContext({}, {});
        const input: ExecutionLayerInput = {
            type: "flc-001",
            payload: null,
            metadata: {},
        };

        // Frozen logical contract: execute(context, input) returns the same context.
        expect(engine.execute(context, input)).toBe(context);

        const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(engine));
        expect(proto).toContain("execute");
        expect(proto).not.toEqual(
            expect.arrayContaining(["schedule", "enqueue", "emitEvent", "modifyPipeline"])
        );
    });
});
