import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { Dispatcher } from "../../src/orchestration/Dispatcher";
import { EngineRegistry } from "../../src/orchestration/EngineRegistry";
import { ErrorPolicy } from "../../src/orchestration/ErrorPolicy";
import { ExecutionCoordinator } from "../../src/orchestration/ExecutionCoordinator";
import { GraphBuilder } from "../../src/orchestration/GraphBuilder";
import { LifecycleController } from "../../src/orchestration/LifecycleController";
import { OrchestrationContext } from "../../src/orchestration/OrchestrationContext";
import { ResultCollector } from "../../src/orchestration/ResultCollector";

describe("EngineRegistry and ExecutionCoordinator", () => {
    test("EngineRegistry resolves NodeID → ExecutionEngine uniquely", () => {
        const registry = new EngineRegistry();
        const engine = new DefaultExecutionEngine();
        registry.bind("n1", engine);
        expect(registry.resolveEngine("n1")).toBe(engine);
        expect(() => registry.bind("n1", new DefaultExecutionEngine())).toThrow(/already bound/);
        expect(() => registry.resolveEngine("missing")).toThrow(/No ExecutionEngine/);
    });

    test("single-dispatch invariant", () => {
        const graph = GraphBuilder.build({
            nodes: [{ id: "a", dependencies: [] }],
        });
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        context.setState("Running");
        const collector = new ResultCollector(context, new ErrorPolicy("CONTINUE"), lifecycle);
        const coordinator = new ExecutionCoordinator(new Dispatcher(), collector, graph);
        const registry = new EngineRegistry();
        registry.bind("a", new DefaultExecutionEngine());

        coordinator.dispatch(new Set(["a"]), registry);
        coordinator.dispatch(new Set(["a"]), registry);

        expect(coordinator.getDispatchedNodes().size).toBe(1);
        expect(context.completedNodes).toEqual(["a"]);
        // Second dispatch must not double-complete / double-event beyond first completion path
        const completedEvents = context.events.filter((e) => e.type === "node.completed");
        expect(completedEvents.length).toBe(1);
    });

    test("ExecutionCoordinator dispatch resolves via registry and notifies ResultCollector", () => {
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
        const collector = new ResultCollector(context, new ErrorPolicy("CONTINUE"), lifecycle);
        const coordinator = new ExecutionCoordinator(new Dispatcher(), collector, graph);
        const registry = new EngineRegistry();
        registry.bind("a", new DefaultExecutionEngine());
        registry.bind("b", new DefaultExecutionEngine());

        const first = coordinator.selectExecutable(new Set());
        expect([...first]).toEqual(["a"]);
        coordinator.dispatch(first, registry);
        expect(context.completedNodes).toContain("a");

        const second = coordinator.selectExecutable(new Set(context.completedNodes));
        expect([...second]).toEqual(["b"]);
        coordinator.dispatch(second, registry);
        expect(context.completedNodes).toEqual(["a", "b"]);
    });
});
