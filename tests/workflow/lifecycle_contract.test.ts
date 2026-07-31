import { WorkflowBuilder } from "../../src/workflow/WorkflowBuilder";
import { Workflow } from "../../src/workflow/Workflow";

describe("Workflow lifecycle contract", () => {
    test("Created → Validated → Immutable → GraphBuilt → Ready", () => {
        const w = new WorkflowBuilder()
            .id("wf-lc")
            .name("LC")
            .version("1")
            .addStep({ id: "a", dependencies: [] })
            .addStep({ id: "b", dependencies: ["a"] })
            .build();
        expect(w.workflow_state).toBe("Immutable");

        Workflow.buildExecutionGraph(w);
        expect(w.workflow_state).toBe("Ready");
    });

    test("Workflow responsibility ends at Ready; no Running state on Workflow", () => {
        const w = new WorkflowBuilder()
            .id("wf")
            .name("n")
            .version("1")
            .addStep({ id: "a", dependencies: [] })
            .build();
        Workflow.buildExecutionGraph(w);
        expect(w.workflow_state).toBe("Ready");
        expect((w.workflow_state as string) === "Running").toBe(false);
    });
});
