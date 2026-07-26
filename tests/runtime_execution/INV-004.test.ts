import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";

/**
 * INV-004 Event/Pipeline/Scheduler の意味論を保持する
 * Mapping: Section 8 Semantic Equivalence
 */
describe("INV-004", () => {
    test("INV-004", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        const sources = fs
            .readdirSync(runtimeExecutionDir)
            .filter((name) => name.endsWith(".ts"))
            .map((name) => ({
                name,
                body: fs.readFileSync(path.join(runtimeExecutionDir, name), "utf8"),
            }));

        for (const source of sources) {
            expect(source.body).not.toMatch(
                /from\s+["'][^"']*(runtime_event|runtime_pipeline|runtime_scheduler|pre_pipeline)[^"']*["']/
            );
            expect(source.body).not.toMatch(
                /\b(schedule|enqueue|emitEvent|dispatchEvent)\s*\(/
            );
        }

        const engine = new DefaultExecutionEngine();
        const engineKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(engine));
        expect(engineKeys).not.toEqual(
            expect.arrayContaining(["schedule", "enqueue", "emitEvent", "dispatchEvent"])
        );
        expect(typeof (engine as { execute: unknown }).execute).toBe("function");
    });
});
