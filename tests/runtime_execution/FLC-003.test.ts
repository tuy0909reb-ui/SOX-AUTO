import * as fs from "fs";
import * as path from "path";
import { Adapter, DefaultAdapter } from "../../src/runtime_execution/Adapter";
import { ExternalRuntimeState } from "../../src/runtime_execution/types";

/**
 * FLC-003 Adapter の論理契約は凍結される
 * Mapping: Section 9 Frozen Items
 */
describe("FLC-003", () => {
    test("FLC-003", () => {
        const baselinePath = path.resolve(__dirname, "../../docs/baselines/ASA-ARCH-20.8.md");
        const baseline = fs.readFileSync(baselinePath, "utf8");
        expect(baseline).toMatch(/FLC-003 Adapter の論理契約は凍結される/);

        const adapterSource = fs.readFileSync(
            path.resolve(__dirname, "../../src/runtime_execution/Adapter.ts"),
            "utf8"
        );
        expect(adapterSource).toMatch(/export interface Adapter/);
        expect(adapterSource).toMatch(/export class DefaultAdapter implements Adapter/);

        const external: ExternalRuntimeState = { connected: true };
        const adapter: Adapter = new DefaultAdapter(external);

        // Frozen logical contract: connection via safe projection, no write-through.
        const projected = (adapter as DefaultAdapter).project();
        expect(projected).toEqual(external);
        expect(projected).not.toBe(external);
        expect(Object.isFrozen(projected)).toBe(true);
        expect(adapterSource).not.toMatch(/from\s+["']\.\/ExecutionEngine["']/);
        expect(adapterSource).not.toMatch(/from\s+["']\.\/ExecutionContext["']/);
    });
});
