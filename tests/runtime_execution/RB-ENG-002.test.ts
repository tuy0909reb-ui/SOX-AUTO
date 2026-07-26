import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";

/**
 * RB-ENG-002 Engine はスケジューリングを行わない
 * Mapping: Section 4.2 Requirements
 */
describe("RB-ENG-002", () => {
    test("RB-ENG-002", () => {
        const enginePath = path.resolve(
            __dirname,
            "../../src/runtime_execution/ExecutionEngine.ts"
        );
        const body = fs.readFileSync(enginePath, "utf8");

        expect(body).not.toMatch(/\b(schedule|scheduler|reschedule)\b/i);
        expect(body).not.toMatch(/\bsetTimeout\s*\(/);
        expect(body).not.toMatch(/\bsetInterval\s*\(/);

        const engine = new DefaultExecutionEngine();
        const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(engine));
        expect(proto).not.toEqual(expect.arrayContaining(["schedule", "reschedule"]));
        expect(proto).toContain("execute");
    });
});
