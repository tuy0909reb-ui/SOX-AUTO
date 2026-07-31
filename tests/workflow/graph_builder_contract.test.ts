import { Workflow, WorkflowGraphBuildError } from "../../src/workflow/Workflow";
import { WorkflowBuilder } from "../../src/workflow/WorkflowBuilder";
import { WorkflowBuildError } from "../../src/workflow/WorkflowBuildError";

describe("GraphBuilder contract (Workflow → ExecutionGraph)", () => {
    test("builds acyclic ExecutionGraph from Workflow without modifying Workflow", () => {
        const w = new WorkflowBuilder()
            .id("wf-g")
            .name("G")
            .version("1")
            .addStep({ id: "a", dependencies: [] })
            .addStep({ id: "b", dependencies: ["a"] })
            .build();

        const idBefore = w.workflow_id;
        const pipelineBefore = w.pipeline.map((s) => s.id).join(",");
        const graph = Workflow.buildExecutionGraph(w);

        expect(graph.size).toBe(2);
        expect(Object.isFrozen(graph)).toBe(true);
        expect(w.workflow_id).toBe(idBefore);
        expect(w.pipeline.map((s) => s.id).join(",")).toBe(pipelineBefore);
        expect(Object.isFrozen(w)).toBe(true);
    });

    test("fails without producing partial ExecutionGraph", () => {
        const w = new WorkflowBuilder()
            .id("wf-bad")
            .name("Bad")
            .version("1")
            // cycle a↔b — validate allows mutual deps in definition; graph validator catches cycle
            .addStep({ id: "a", dependencies: ["b"] })
            .addStep({ id: "b", dependencies: ["a"] })
            .build();

        let thrown: unknown;
        try {
            Workflow.buildExecutionGraph(w);
        } catch (e) {
            thrown = e;
        }
        expect(thrown).toBeInstanceOf(WorkflowGraphBuildError);
        expect(thrown).toBeInstanceOf(WorkflowBuildError);
        // Workflow definition unchanged; still Immutable (graph not built)
        expect(w.workflow_state).toBe("Immutable");
    });

    test("acyclic complete unique NodeIDs compatible with 20.9.x Orchestrator", async () => {
        const { Orchestrator } = await import("../../src/orchestration/Orchestrator");
        const w = new WorkflowBuilder()
            .id("wf-orch")
            .name("Orch")
            .version("1")
            .withExecutionPolicy({ errorPolicy: "STOP_ON_ERROR" })
            .addStep({ id: "a", dependencies: [] })
            .addStep({ id: "b", dependencies: ["a"] })
            .build();
        const graph = Workflow.buildExecutionGraph(w);
        expect(new Set(graph.nodeIds).size).toBe(graph.size);
        expect(graph.size).toBe(w.pipeline.length);

        const orch = new Orchestrator();
        orch.initialize(w.toRuntimePlan());
        const result = await orch.execute();
        expect(result.state).toBe("Completed");
        expect(result.completedNodes.sort()).toEqual(["a", "b"]);
    });
});
