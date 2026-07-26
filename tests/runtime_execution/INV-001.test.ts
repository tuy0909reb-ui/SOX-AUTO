import * as fs from "fs";
import * as path from "path";

/**
 * INV-001 20.8 は additive である
 * Mapping: Section 1 Overview
 */
describe("INV-001", () => {
    test("INV-001", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        expect(fs.existsSync(runtimeExecutionDir)).toBe(true);

        const files = fs
            .readdirSync(runtimeExecutionDir)
            .filter((name) => name.endsWith(".ts"));

        // Additive layer: Execution Layer modules exist as an addition.
        expect(files).toEqual(
            expect.arrayContaining([
                "types.ts",
                "ExecutionLayerInput.ts",
                "ExecutionContext.ts",
                "ExecutionEngine.ts",
                "Adapter.ts",
                "index.ts",
            ])
        );

        // Additive layer must not absorb Event / Pipeline / Scheduler ownership modules.
        for (const file of files) {
            expect(file.toLowerCase()).not.toMatch(/event|pipeline|scheduler/);
        }
    });
});
