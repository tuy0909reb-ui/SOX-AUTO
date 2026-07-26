import * as fs from "fs";
import * as path from "path";

/**
 * RB-ADP-003 Adapter は双方向依存を作らない
 * Mapping: Section 5.2 Requirements
 */
describe("RB-ADP-003", () => {
    test("RB-ADP-003", () => {
        const adapterPath = path.resolve(__dirname, "../../src/runtime_execution/Adapter.ts");
        const body = fs.readFileSync(adapterPath, "utf8");
        const importPattern = /from\s+["']([^"']+)["']/g;
        const imports = [...body.matchAll(importPattern)].map((match) => match[1]);

        for (const specifier of imports) {
            expect(specifier.startsWith("./")).toBe(true);
            expect(specifier.startsWith("../")).toBe(false);
        }

        // Adapter depends on ExternalRuntimeState only; it must not import Engine/Context.
        expect(imports).toContain("./types");
        expect(imports).not.toContain("./ExecutionEngine");
        expect(imports).not.toContain("./ExecutionContext");
        expect(body).not.toMatch(/\b(DefaultExecutionEngine|DefaultExecutionContext)\b/);
    });
});
