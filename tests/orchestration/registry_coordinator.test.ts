import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { DefaultDispatchStrategy } from "../../src/orchestration/DispatchStrategy";
import { Dispatcher } from "../../src/orchestration/Dispatcher";
import { EnginePool } from "../../src/orchestration/EnginePool";
import { EngineRegistry } from "../../src/orchestration/EngineRegistry";
import { ErrorPolicy } from "../../src/orchestration/ErrorPolicy";
import { ExecutionCoordinator } from "../../src/orchestration/ExecutionCoordinator";
import { GraphBuilder } from "../../src/orchestration/GraphBuilder";
import { LifecycleController } from "../../src/orchestration/LifecycleController";
import { OrchestrationContext } from "../../src/orchestration/OrchestrationContext";
import { ResultCollector } from "../../src/orchestration/ResultCollector";

describe("EngineRegistry and ExecutionCoordinator", () => {
    test("EngineRegistry resolves definitions only (not runtime instances)", () => {
        const registry = new EngineRegistry();
        registry.registerDefinition({
            nodeId: "n1",
            metadata: { kind: "default" },
            create: () => new DefaultExecutionEngine(),
        });
        const def = registry.resolveDefinition("n1");
        expect(def.nodeId).toBe("n1");
        expect(def.metadata).toEqual({ kind: "default" });
        expect(() =>
            registry.registerDefinition({
                nodeId: "n1",
                metadata: {},
                create: () => new DefaultExecutionEngine(),
            })
        ).toThrow(/already registered/);
    });

    test("single-dispatch invariant with EnginePool", () => {
        const graph = GraphBuilder.build({
            nodes: [{ id: "a", dependencies: [] }],
        });
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        context.setState("Running");
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
        coordinator.dispatch(new Set(["a"]), registry);

        expect(coordinator.getDispatchedNodes().size).toBe(1);
        expect(context.completedNodes).toEqual(["a"]);
        const completedEvents = context.events.filter((e) => e.type === "node.completed");
        expect(completedEvents.length).toBe(1);
    });

    test("ExecutionCoordinator acquire/dispatch/release via pool", () => {
        const graph = GraphBuilder.build({
            nodes: [
                { id: "a", dependencies: [] },
                { id: "b", dependencies: ["a"] },
            ],
        });
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        const policy = new ErrorPolicy("CONTINUE", lifecycle, context);
        const collector = new ResultCollector(context, policy);
        const registry = new EngineRegistry();
        registry.bind("a", () => new DefaultExecutionEngine());
        registry.bind("b", () => new DefaultExecutionEngine());
        const pool = new EnginePool(registry);
        const coordinator = new ExecutionCoordinator(
            new Dispatcher(),
            collector,
            graph,
            pool,
            new DefaultDispatchStrategy()
        );

        const first = coordinator.selectExecutable(new Set());
        expect([...first]).toEqual(["a"]);
        coordinator.dispatch(first, registry);
        expect(context.completedNodes).toContain("a");
        expect(pool.snapshot().every((s) => s.state === "Available" || s.state === "Offline")).toBe(
            true
        );

        const second = coordinator.selectExecutable(new Set(context.completedNodes));
        expect([...second]).toEqual(["b"]);
        coordinator.dispatch(second, registry);
        expect(context.completedNodes).toEqual(["a", "b"]);
    });
});
