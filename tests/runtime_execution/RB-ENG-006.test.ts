import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";

/**
 * RB-ENG-006 Engine は Scheduler の順序を変更しない
 * Mapping: Section 4.2 Requirements
 */
describe("RB-ENG-006", () => {
    test("RB-ENG-006", () => {
        const enginePath = path.resolve(
            __dirname,
            "../../src/runtime_execution/ExecutionEngine.ts"
        );
        const body = fs.readFileSync(enginePath, "utf8");

        expect(body).not.toMatch(/\b(scheduler|schedulingOrder|reorder|priority)\b/i);
        expect(body).not.toMatch(/\bsort\s*\(/);

        const engine = new DefaultExecutionEngine();
        const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(engine));
        expect(proto).not.toEqual(
            expect.arrayContaining(["reorder", "setPriority", "changeScheduleOrder"])
        );
    });
});
