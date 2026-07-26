import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * DEP-002 20.8 は既存 Runtime の API を変更しない
 * Mapping: Section 1 Overview
 */
describe("DEP-002", () => {
    test("DEP-002", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        const sources = fs
            .readdirSync(runtimeExecutionDir)
            .filter((name) => name.endsWith(".ts"))
            .map((name) => fs.readFileSync(path.join(runtimeExecutionDir, name), "utf8"));

        for (const body of sources) {
            expect(body).not.toMatch(/\bObject\.defineProperty\s*\(/);
            expect(body).not.toMatch(/\bObject\.setPrototypeOf\s*\(/);
            expect(body).not.toMatch(/\bglobalThis\s*\[/);
            expect(body).not.toMatch(/\b(module|exports)\s*\.\s*(exports\s*=)/);
        }

        const external = { api: "stable", call: () => "ok" };
        const originalCall = external.call;
        const context = new DefaultExecutionContext(external, {});
        const engine = new DefaultExecutionEngine();
        const input: ExecutionLayerInput = {
            type: "dep-002",
            payload: null,
            metadata: {},
        };

        engine.execute(context, input);

        expect(external.api).toBe("stable");
        expect(external.call).toBe(originalCall);
        expect(external.call()).toBe("ok");
    });
});
