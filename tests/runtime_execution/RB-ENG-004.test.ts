import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * RB-ENG-004 Engine は Event を生成しない
 * Mapping: Section 4.2 Requirements
 */
describe("RB-ENG-004", () => {
    test("RB-ENG-004", () => {
        const enginePath = path.resolve(
            __dirname,
            "../../src/runtime_execution/ExecutionEngine.ts"
        );
        const body = fs.readFileSync(enginePath, "utf8");

        expect(body).not.toMatch(/\b(emit|emitEvent|createEvent|dispatchEvent|new\s+\w*Event)\b/);

        const engine = new DefaultExecutionEngine();
        const context = new DefaultExecutionContext({}, {});
        const input: ExecutionLayerInput = {
            type: "rb-eng-004",
            payload: { eventLike: true },
            metadata: {},
        };

        const result = engine.execute(context, input);
        expect(result).toBe(context);
        expect(result).not.toMatchObject({ type: expect.any(String), event: expect.anything() });
    });
});
