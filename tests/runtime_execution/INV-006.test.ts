import * as fs from "fs";
import * as path from "path";

/**
 * INV-006 依存方向は 20.8 → 20.0〜20.7 のみ
 * Mapping: Section 1 Overview
 */
describe("INV-006", () => {
    test("INV-006", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        const files = fs.readdirSync(runtimeExecutionDir).filter((name) => name.endsWith(".ts"));
        const importPattern = /from\s+["']([^"']+)["']/g;

        for (const file of files) {
            const body = fs.readFileSync(path.join(runtimeExecutionDir, file), "utf8");
            const imports = [...body.matchAll(importPattern)].map((match) => match[1]);

            for (const specifier of imports) {
                // 20.8 sources may only depend inward via same-package relative imports
                // (External Runtime is consumed as abstract read-only state, not via reverse deps).
                expect(specifier.startsWith("./")).toBe(true);
                expect(specifier.startsWith("../")).toBe(false);
                const resolved = path.resolve(runtimeExecutionDir, specifier);
                expect(
                    resolved === runtimeExecutionDir ||
                        resolved.startsWith(runtimeExecutionDir + path.sep)
                ).toBe(true);
            }
        }
    });
});
