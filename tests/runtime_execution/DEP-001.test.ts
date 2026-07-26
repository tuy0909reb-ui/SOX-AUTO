import * as fs from "fs";
import * as path from "path";
import { ExternalRuntimeState } from "../../src/runtime_execution/types";
import { DefaultAdapter } from "../../src/runtime_execution/Adapter";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";

/**
 * DEP-001 20.8 は既存 Runtime に依存するが、逆依存は許されない
 * Mapping: Section 1 Overview
 */
describe("DEP-001", () => {
    test("DEP-001", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        const files = fs.readdirSync(runtimeExecutionDir).filter((name) => name.endsWith(".ts"));
        const importPattern = /from\s+["']([^"']+)["']/g;

        // Depends on existing Runtime via ExternalRuntimeState abstraction.
        const external: ExternalRuntimeState = {};
        const context = new DefaultExecutionContext(external, {});
        const adapter = new DefaultAdapter(external);
        expect(context.runtimeState).toBeDefined();
        expect(adapter.project()).toBeDefined();

        // Reverse dependency forbidden: 20.8 sources must not import outward packages.
        for (const file of files) {
            const body = fs.readFileSync(path.join(runtimeExecutionDir, file), "utf8");
            const imports = [...body.matchAll(importPattern)].map((match) => match[1]);
            for (const specifier of imports) {
                expect(specifier.startsWith("./")).toBe(true);
                expect(specifier.startsWith("../")).toBe(false);
            }
        }
    });
});
