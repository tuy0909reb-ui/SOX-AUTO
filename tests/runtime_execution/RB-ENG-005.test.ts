import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";

/**
 * RB-ENG-005 Engine は Pipeline を変更しない
 * Mapping: Section 4.2 Requirements
 */
describe("RB-ENG-005", () => {
    test("RB-ENG-005", () => {
        const enginePath = path.resolve(
            __dirname,
            "../../src/runtime_execution/ExecutionEngine.ts"
        );
        const body = fs.readFileSync(enginePath, "utf8");

        expect(body).not.toMatch(/\bpipeline\b/i);
        expect(body).not.toMatch(/\b(RuntimePipeline|PipelineCoordinator)\b/);

        const engine = new DefaultExecutionEngine();
        const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(engine));
        expect(proto).not.toEqual(
            expect.arrayContaining(["setPipeline", "modifyPipeline", "replacePipeline"])
        );
    });
});
