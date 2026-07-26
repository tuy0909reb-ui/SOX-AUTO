import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";

/**
 * RB-ENG-003 Engine はキューを所有しない
 * Mapping: Section 4.2 Requirements
 */
describe("RB-ENG-003", () => {
    test("RB-ENG-003", () => {
        const enginePath = path.resolve(
            __dirname,
            "../../src/runtime_execution/ExecutionEngine.ts"
        );
        const body = fs.readFileSync(enginePath, "utf8");

        expect(body).not.toMatch(/\b(queue|enqueue|dequeue|EventQueue)\b/i);

        const engine = new DefaultExecutionEngine();
        expect("queue" in engine).toBe(false);
        expect(Object.getOwnPropertyNames(engine)).not.toContain("queue");
    });
});
