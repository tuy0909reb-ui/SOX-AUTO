import {
    DefaultExecutionEngine,
    ExecutionEngine,
} from "../../src/runtime_execution/ExecutionEngine";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";
import { ErrorPolicy } from "../../src/orchestration/ErrorPolicy";
import { LifecycleController } from "../../src/orchestration/LifecycleController";
import { OrchestrationContext } from "../../src/orchestration/OrchestrationContext";
import { Orchestrator } from "../../src/orchestration/Orchestrator";
import { ResultCollector } from "../../src/orchestration/ResultCollector";

class FailingEngine implements ExecutionEngine {
    execute(_context: DefaultExecutionContext, _input: ExecutionLayerInput): unknown {
        throw new Error("engine failed");
    }
}

describe("ResultCollector, ErrorPolicy, Dispatch loop", () => {
    test("ResultCollector updates context then evaluates ErrorPolicy", () => {
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        const policy = new ErrorPolicy("STOP_ON_ERROR", lifecycle, context);
        const collector = new ResultCollector(context, policy);

        collector.collect({
            nodeId: "a",
            error: new Error("boom"),
        });

        expect(context.errors.some((e) => e.nodeId === "a")).toBe(true);
        expect(collector.getLastDecision()).toBe("TERMINATE");
        expect(lifecycle.state).toBe("Failed");
        expect(context.state).toBe("Failed");
    });

    test("ErrorPolicy CONTINUE does not terminate", () => {
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const context = new OrchestrationContext();
        const collector = new ResultCollector(
            context,
            new ErrorPolicy("CONTINUE", lifecycle, context)
        );
        collector.collect({ nodeId: "a", error: new Error("x") });
        expect(collector.getLastDecision()).toBe("CONTINUE");
        expect(lifecycle.state).toBe("Running");
    });

    test("dispatch loop terminates when all nodes completed", async () => {
        const orch = new Orchestrator();
        orch.initialize({
            nodes: [
                { id: "a", dependencies: [] },
                { id: "b", dependencies: ["a"] },
                { id: "c", dependencies: ["b"] },
            ],
        });
        const result = await orch.execute();
        expect(result.state).toBe("Completed");
        expect(result.completedNodes.sort()).toEqual(["a", "b", "c"]);
    });

    test("failure propagation via STOP_ON_ERROR terminates loop", async () => {
        const orch = new Orchestrator((nodeId) =>
            nodeId === "a" ? new FailingEngine() : new DefaultExecutionEngine()
        );
        orch.initialize({
            nodes: [
                { id: "a", dependencies: [] },
                { id: "b", dependencies: ["a"] },
            ],
            errorPolicy: "STOP_ON_ERROR",
        });
        const result = await orch.execute();
        expect(result.state).toBe("Failed");
        expect(result.errors.some((e) => e.nodeId === "a")).toBe(true);
        expect(result.completedNodes).not.toContain("b");
    });

    test("context update path: engines do not mutate context directly", () => {
        const context = new OrchestrationContext();
        const snapshotBefore = context.snapshot();
        const lifecycle = new LifecycleController();
        lifecycle.transition("INITIALIZE_SUCCESS");
        lifecycle.transition("MARK_READY");
        lifecycle.transition("START_EXECUTE");
        const collector = new ResultCollector(
            context,
            new ErrorPolicy("COLLECT_ERRORS", lifecycle, context)
        );
        collector.collect({ nodeId: "n", result: { ok: true }, error: null });
        const snapshotAfter = context.snapshot();
        expect(snapshotBefore.completedNodes).toEqual([]);
        expect(snapshotAfter.completedNodes).toEqual(["n"]);
        expect(snapshotBefore.completedNodes).toEqual([]);
    });
});
