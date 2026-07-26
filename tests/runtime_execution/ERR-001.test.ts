import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * ERR-001 エラーは定義された分類体系に従う
 * Mapping: Section 7 Error Model
 */
describe("ERR-001", () => {
    test("ERR-001", () => {
        const baselinePath = path.resolve(__dirname, "../../docs/baselines/ASA-ARCH-20.8.md");
        const baseline = fs.readFileSync(baselinePath, "utf8");

        // Defined classification system (Baseline Error Handling).
        expect(baseline).toMatch(/ERR-001/);
        expect(baseline).toMatch(/ERR-002/);
        expect(baseline).toMatch(/ERR-003/);
        expect(baseline).toMatch(/## 2\.6 Error Handling \(ERR-001〜ERR-003\)/);

        const enginePath = path.resolve(
            __dirname,
            "../../src/runtime_execution/ExecutionEngine.ts"
        );
        const engineSource = fs.readFileSync(enginePath, "utf8");

        // Engine must not invent an alternate ad-hoc error taxonomy.
        expect(engineSource).not.toMatch(/\benum\s+\w*Error/);
        expect(engineSource).not.toMatch(/\bthrow\s+["']/);

        const engine = new DefaultExecutionEngine();
        const context = new DefaultExecutionContext({}, {});
        const input: ExecutionLayerInput = {
            type: "err-001",
            payload: null,
            metadata: {},
        };

        expect(() => engine.execute(context, input)).not.toThrow();
    });
});
