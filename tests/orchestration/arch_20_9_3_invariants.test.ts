import * as fs from "fs";
import * as path from "path";
import { DefaultDispatchStrategy } from "../../src/orchestration/DispatchStrategy";
import { EnginePool } from "../../src/orchestration/EnginePool";
import { EngineRegistry } from "../../src/orchestration/EngineRegistry";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { GraphBuilder } from "../../src/orchestration/GraphBuilder";
import { Scheduler } from "../../src/orchestration/Scheduler";
import { ScheduledNodeQueue } from "../../src/orchestration/ScheduledNodeQueue";

const ORCH = path.resolve(__dirname, "../../src/orchestration");

function src(name: string): string {
    return fs.readFileSync(path.join(ORCH, name), "utf8");
}

function importsOf(file: string): string[] {
    return [...src(file).matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
}

describe("ASA-ARCH-20.9.3 Invariants", () => {
    test("INV-DISP-001 Dispatcher SHALL NOT perform dependency resolution", () => {
        expect(importsOf("Dispatcher.ts").some((i) => i.includes("DependencyResolver"))).toBe(
            false
        );
        expect(src("Dispatcher.ts")).toMatch(/SHALL NOT perform dependency resolution/);
    });

    test("INV-SCH-001 Scheduler SHALL NOT assign engines", () => {
        expect(importsOf("Scheduler.ts").some((i) => i.includes("EnginePool"))).toBe(false);
        expect(src("Scheduler.ts")).toMatch(/SHALL NOT assign engines/);
    });

    test("INV-SCH-002 Scheduler SHALL NOT modify ExecutionGraph", () => {
        const graph = GraphBuilder.build({ nodes: [{ id: "a", dependencies: [] }] });
        const before = graph.nodeIds.join(",");
        new Scheduler().schedule(new Set(["a"]), graph, new Set());
        expect(graph.nodeIds.join(",")).toBe(before);
        expect(Object.isFrozen(graph)).toBe(true);
    });

    test("INV-SCH-003 Scheduler evaluates immutable CompletedNodeSet view", () => {
        expect(src("Scheduler.ts")).toMatch(/immutable view|Immutable view/i);
        const completed = new Set(["a"]);
        const graph = GraphBuilder.build({
            nodes: [
                { id: "a", dependencies: [] },
                { id: "b", dependencies: ["a"] },
            ],
        });
        new Scheduler().schedule(new Set(["b"]), graph, completed);
        expect([...completed]).toEqual(["a"]);
    });

    test("INV-DEP-001 DependencyResolver SHALL NOT generate ExecutableNodeSet", () => {
        expect(src("DependencyResolver.ts")).toMatch(/SHALL NOT generate ExecutableNodeSet/);
    });

    test("INV-POL-001 SchedulingPolicy SHALL NOT inspect EnginePool", () => {
        expect(importsOf("SchedulingPolicy.ts").some((i) => i.includes("EnginePool"))).toBe(
            false
        );
    });

    test("INV-CON-001 ConcurrencyPolicy SHALL NOT reorder nodes", () => {
        expect(src("ConcurrencyPolicy.ts")).toMatch(/SHALL NOT reorder/);
    });

    test("INV-Q-001 ScheduledNodeQueue contracts", () => {
        expect(src("ScheduledNodeQueue.ts")).toMatch(/immutable/i);
        const q = ScheduledNodeQueue.from(["a", "b"]);
        expect(Object.isFrozen(q)).toBe(true);
    });

    test("INV-DSQ-001 DispatchStrategy consumes ScheduledNodeQueue without modifying it", () => {
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        registry.bind("b", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const q = ScheduledNodeQueue.from(["b", "a"]);
        const before = q.toArray().join(",");
        const plan = new DefaultDispatchStrategy().planFromQueue(q, pool);
        expect(q.toArray().join(",")).toBe(before);
        expect(plan.map((p) => p.nodeId)).toEqual(["b", "a"]);
    });

    test("INV-RT-001 Runtime Execution Layer unchanged by 20.9.3", () => {
        const runtimeDir = path.resolve(__dirname, "../../src/runtime_execution");
        const files = fs.readdirSync(runtimeDir).filter((f) => f.endsWith(".ts")).sort();
        expect(files).toEqual([
            "Adapter.ts",
            "ExecutionContext.ts",
            "ExecutionEngine.ts",
            "ExecutionLayerInput.ts",
            "index.ts",
            "types.ts",
        ]);
    });
});
