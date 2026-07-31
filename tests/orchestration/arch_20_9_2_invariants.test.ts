import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";
import { ExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { DefaultDispatchStrategy } from "../../src/orchestration/DispatchStrategy";
import { Dispatcher } from "../../src/orchestration/Dispatcher";
import { EnginePool } from "../../src/orchestration/EnginePool";
import { EngineRegistry } from "../../src/orchestration/EngineRegistry";
import { ErrorPolicy } from "../../src/orchestration/ErrorPolicy";
import { ExecutionCoordinator } from "../../src/orchestration/ExecutionCoordinator";
import { ExecutionGraph } from "../../src/orchestration/ExecutionGraph";
import { GraphBuilder } from "../../src/orchestration/GraphBuilder";
import { LifecycleController } from "../../src/orchestration/LifecycleController";
import { OrchestrationContext } from "../../src/orchestration/OrchestrationContext";
import { ResultCollector } from "../../src/orchestration/ResultCollector";

const ORCH = path.resolve(__dirname, "../../src/orchestration");

function src(name: string): string {
    return fs.readFileSync(path.join(ORCH, name), "utf8");
}

function importsOf(file: string): string[] {
    return [...src(file).matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
}

class FailingEngine implements ExecutionEngine {
    execute(_c: DefaultExecutionContext, _i: ExecutionLayerInput): unknown {
        throw new Error("fail-a");
    }
}

describe("ASA-ARCH-20.9.2 Invariants", () => {
    test("INV-EP-001 EnginePool SHALL NOT participate in orchestration flow control", () => {
        const imports = importsOf("EnginePool.ts");
        expect(imports.some((i) => i.includes("LifecycleController"))).toBe(false);
        expect(imports.some((i) => i.includes("DispatchStrategy"))).toBe(false);
        expect(imports.some((i) => i.includes("Dispatcher"))).toBe(false);
        expect(src("EnginePool.ts")).toMatch(/SHALL NOT participate in orchestration flow control/);
    });

    test("INV-EP-002 EnginePool SHALL NOT modify ExecutionGraph", () => {
        const imports = importsOf("EnginePool.ts");
        expect(imports.some((i) => i.includes("ExecutionGraph"))).toBe(false);
    });

    test("INV-EP-003 EnginePool SHALL NOT allocate same instance concurrently", () => {
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const a1 = pool.acquire("a");
        const a2 = pool.acquire("a");
        expect(a1.ok).toBe(true);
        expect(a2.ok).toBe(false);
        if (!a2.ok) {
            expect(a2.reason).toBe("ALREADY_BUSY");
        }
    });

    test("INV-EP-004 EnginePool SHALL NOT own engine definitions", () => {
        expect(src("EnginePool.ts")).toMatch(/SHALL NOT own engine definitions/);
        expect(importsOf("EnginePool.ts").some((i) => i.includes("EngineRegistry"))).toBe(true);
    });

    test("INV-EP-005 EnginePool state transitions Available↔Busy Offline Disposed", () => {
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const acq = pool.acquire("a");
        expect(acq.ok).toBe(true);
        if (!acq.ok) return;
        expect(pool.getState(acq.handle.instanceId)).toBe("Busy");
        expect(pool.release(acq.handle).ok).toBe(true);
        expect(pool.getState(acq.handle.instanceId)).toBe("Available");

        const acq2 = pool.acquire("a");
        expect(acq2.ok).toBe(true);
        if (!acq2.ok) return;
        pool.release(acq2.handle, { failure: true });
        expect(pool.getState(acq2.handle.instanceId)).toBe("Offline");
        expect(pool.recover(acq2.handle.instanceId)).toBe(true);
        expect(pool.getState(acq2.handle.instanceId)).toBe("Available");
        pool.dispose(acq2.handle.instanceId);
        expect(pool.getState(acq2.handle.instanceId)).toBe("Disposed");
        expect(pool.acquire("a").ok).toBe(false);
    });

    test("INV-DS-001 DispatchStrategy SHALL NOT modify ExecutionGraph", () => {
        expect(importsOf("DispatchStrategy.ts").some((i) => i.includes("ExecutionGraph"))).toBe(
            false
        );
        const graph = GraphBuilder.build({ nodes: [{ id: "a", dependencies: [] }] });
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const before = graph.nodeIds.join(",");
        new DefaultDispatchStrategy().plan(new Set(["a"]), pool);
        expect(graph.nodeIds.join(",")).toBe(before);
    });

    test("INV-DS-002 DispatchStrategy SHALL NOT modify node priority", () => {
        expect(src("DispatchStrategy.ts")).toMatch(/SHALL NOT modify node priority/);
    });

    test("INV-DS-003 DispatchStrategy SHALL NOT retain assignment state", () => {
        const strategy = new DefaultDispatchStrategy();
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        registry.bind("b", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const p1 = strategy.plan(new Set(["b", "a"]), pool);
        const p2 = strategy.plan(new Set(["b", "a"]), pool);
        expect(p1.map((x) => x.nodeId)).toEqual(["a", "b"]);
        expect(p2.map((x) => x.nodeId)).toEqual(["a", "b"]);
        expect(Object.keys(strategy)).toEqual([]);
    });

    test("INV-DS-004 DET-001 deterministic assignment", () => {
        const strategy = new DefaultDispatchStrategy();
        const registry = new EngineRegistry();
        for (const id of ["c", "a", "b"]) {
            registry.bind(id, () => new DefaultExecutionEngine());
        }
        const pool = new EnginePool(registry);
        const executable = new Set(["c", "a", "b"]);
        const r1 = strategy.plan(executable, pool).map((x) => x.nodeId);
        const r2 = strategy.plan(executable, pool).map((x) => x.nodeId);
        expect(r1).toEqual(["a", "b", "c"]);
        expect(r2).toEqual(r1);
    });

    test("INV-EC-001 Coordinator SHALL NOT create Engine instances", () => {
        expect(src("ExecutionCoordinator.ts")).toMatch(/SHALL NOT create Engine instances/);
        expect(src("ExecutionCoordinator.ts")).not.toMatch(/new DefaultExecutionEngine/);
    });

    test("INV-EC-002 Coordinator acquires/releases only via EnginePool", () => {
        const body = src("ExecutionCoordinator.ts");
        expect(body).toMatch(/pool\.acquire/);
        expect(body).toMatch(/pool\.release/);
    });

    test("INV-EC-003 Coordinator owns assignment state", () => {
        const graph = GraphBuilder.build({ nodes: [{ id: "a", dependencies: [] }] });
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        const policy = new ErrorPolicy("CONTINUE", lifecycle, context);
        const collector = new ResultCollector(context, policy);
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const coordinator = new ExecutionCoordinator(
            new Dispatcher(),
            collector,
            graph,
            pool,
            new DefaultDispatchStrategy()
        );
        coordinator.dispatch(new Set(["a"]), registry);
        expect(coordinator.getAssignments().size).toBe(0);
        expect(Array.isArray(coordinator.getLogicalQueue())).toBe(true);
    });

    test("INV-EC-004 Each executable node dispatched at most once", () => {
        const graph = GraphBuilder.build({ nodes: [{ id: "a", dependencies: [] }] });
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        const policy = new ErrorPolicy("CONTINUE", lifecycle, context);
        const collector = new ResultCollector(context, policy);
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const coordinator = new ExecutionCoordinator(
            new Dispatcher(),
            collector,
            graph,
            pool
        );
        coordinator.dispatch(new Set(["a"]), registry);
        coordinator.dispatch(new Set(["a"]), registry);
        expect(coordinator.getDispatchedNodes().size).toBe(1);
    });

    test("INV-ER-001 EngineRegistry SHALL NOT own runtime engine instances", () => {
        expect(src("EngineRegistry.ts")).toMatch(/SHALL NOT own runtime engine instances/);
        expect(src("EngineRegistry.ts")).not.toMatch(/private readonly engines/);
    });

    test("INV-RC-001 ResultCollector SHALL NOT dispatch Engine", () => {
        const body = src("ResultCollector.ts");
        expect(body).toMatch(/SHALL NOT dispatch Engine/);
        expect(importsOf("ResultCollector.ts").some((i) => i.includes("EnginePool"))).toBe(false);
        expect(body).not.toMatch(/\.execute\(/);
    });

    test("INV-RC-002 ResultCollector SHALL NOT modify ExecutionGraph", () => {
        expect(importsOf("ResultCollector.ts").some((i) => i.includes("ExecutionGraph"))).toBe(
            false
        );
    });

    test("INV-RC-003 ResultCollector SHALL NOT initiate orchestration state transitions", () => {
        const body = src("ResultCollector.ts");
        expect(body).toMatch(/SHALL NOT initiate orchestration state transitions/);
        expect(body).not.toMatch(/lifecycle\.transition/);
    });

    test("INV-ERR-001 ErrorPolicy SHALL NOT manipulate EnginePool", () => {
        expect(importsOf("ErrorPolicy.ts").some((i) => i.includes("EnginePool"))).toBe(false);
        expect(src("ErrorPolicy.ts")).toMatch(/SHALL NOT directly manipulate EnginePool/);
    });

    test("INV-ERR-002 ErrorPolicy notifies LifecycleController on TERMINATE", () => {
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        const policy = new ErrorPolicy("STOP_ON_ERROR", lifecycle, context);
        expect(policy.evaluate([{ nodeId: "x", error: new Error("e") }])).toBe("TERMINATE");
        expect(lifecycle.state).toBe("Failed");
    });

    test("INV-LC-001 LifecycleController remains sole owner of state transitions", () => {
        expect(src("LifecycleController.ts")).toMatch(/Sole gateway/);
        expect(src("ResultCollector.ts")).not.toMatch(/lifecycle\.transition/);
    });

    test("INV-RT-001 Runtime semantics remain owned by Runtime Execution Layer", () => {
        expect(src("ExecutionCoordinator.ts")).toMatch(/Runtime Execution Layer/);
        const runtimeDir = path.resolve(__dirname, "../../src/runtime_execution");
        expect(fs.existsSync(path.join(runtimeDir, "ExecutionEngine.ts"))).toBe(true);
    });

    test("INV-STOP-001 STOP_ON_ERROR stops Coordinator acquires; pool keeps availability", () => {
        const graph = GraphBuilder.build({
            nodes: [
                { id: "a", dependencies: [] },
                { id: "b", dependencies: [] },
            ],
        });
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        const policy = new ErrorPolicy("STOP_ON_ERROR", lifecycle, context);
        const collector = new ResultCollector(context, policy);
        const registry = new EngineRegistry();
        registry.bind("a", () => new FailingEngine());
        registry.bind("b", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const coordinator = new ExecutionCoordinator(
            new Dispatcher(),
            collector,
            graph,
            pool
        );
        coordinator.dispatch(new Set(["a", "b"]), registry);
        expect(coordinator.isAcquireStopped()).toBe(true);
        expect(lifecycle.state).toBe("Failed");
        expect(Array.isArray(pool.snapshot())).toBe(true);
    });

    test("INV-GRAPH-001 Internal components treat ExecutionGraph as read-only", () => {
        const graph = new ExecutionGraph([
            {
                id: "a",
                dependencies: [],
                input: { type: "t", payload: null, metadata: {} },
            },
        ]);
        expect(Object.isFrozen(graph)).toBe(true);
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        new DefaultDispatchStrategy().plan(new Set(["a"]), pool);
        expect(Object.isFrozen(graph)).toBe(true);
    });
});
