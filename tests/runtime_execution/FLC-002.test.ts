import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";

/**
 * FLC-002 Execution Context の論理契約は凍結される
 * Mapping: Section 9 Frozen Items
 */
describe("FLC-002", () => {
    test("FLC-002", () => {
        const baselinePath = path.resolve(__dirname, "../../docs/baselines/ASA-ARCH-20.8.md");
        const baseline = fs.readFileSync(baselinePath, "utf8");
        expect(baseline).toMatch(/FLC-002 Execution Context の論理契約は凍結される/);

        const external = { locked: true };
        const context = new DefaultExecutionContext(external, { phase: "ready" });

        // Frozen logical contract: External Runtime projection is read-only / non-mutating.
        expect(Object.isFrozen(context.runtimeState)).toBe(true);
        expect(Object.isFrozen(context.internalState)).toBe(true);
        expect(() => {
            (context.runtimeState as { locked?: boolean }).locked = false;
        }).toThrow();
        expect(external).toEqual({ locked: true });
        expect(context.runtimeState).toEqual({ locked: true });
    });
});
