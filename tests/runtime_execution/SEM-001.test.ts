import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * SEM-001 Event の順序・優先度・意味論は保持される
 * Mapping: Section 8 Semantic Equivalence
 */
describe("SEM-001", () => {
    test("SEM-001", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        const sources = fs
            .readdirSync(runtimeExecutionDir)
            .filter((name) => name.endsWith(".ts"))
            .map((name) => fs.readFileSync(path.join(runtimeExecutionDir, name), "utf8"));

        for (const body of sources) {
            expect(body).not.toMatch(
                /from\s+["'][^"']*(runtime_event|EventQueue|EventRouter|EventDispatch)[^"']*["']/
            );
            expect(body).not.toMatch(/\b(reorderEvents|setEventPriority|emitEvent|dispatchEvent)\b/);
        }

        const eventOrder = ["e1", "e2", "e3"];
        const eventPriority = { e1: 1, e2: 2, e3: 3 };
        const snapshotOrder = [...eventOrder];
        const snapshotPriority = { ...eventPriority };

        const engine = new DefaultExecutionEngine();
        const context = new DefaultExecutionContext(
            { eventOrder, eventPriority },
            {}
        );
        const input: ExecutionLayerInput = {
            type: "sem-001",
            payload: { touchEvents: true },
            metadata: {},
        };

        engine.execute(context, input);

        expect(eventOrder).toEqual(snapshotOrder);
        expect(eventPriority).toEqual(snapshotPriority);
    });
});
