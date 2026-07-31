import { Workflow, WorkflowValidationError } from "../../src/workflow/Workflow";
import { WorkflowBuilder } from "../../src/workflow/WorkflowBuilder";

describe("Workflow definition", () => {
    test("workflow_id uniquely identifies definition; version identifies revision", () => {
        const w = new WorkflowBuilder()
            .id("wf-orders")
            .name("Orders")
            .version("1.0.0")
            .addStep({ id: "a", dependencies: [] })
            .build();
        expect(w.workflow_id).toBe("wf-orders");
        expect(w.workflow_version).toBe("1.0.0");
    });

    test("immutable after successful validation", () => {
        const w = new WorkflowBuilder()
            .id("wf-1")
            .name("N")
            .version("1")
            .addStep({ id: "a", dependencies: [] })
            .build();
        expect(w.workflow_state).toBe("Immutable");
        expect(Object.isFrozen(w)).toBe(true);
        expect(Object.isFrozen(w.pipeline)).toBe(true);
        expect(() => {
            (w as { workflow_id: string }).workflow_id = "x";
        }).toThrow();
    });

    test("rejects invalid definitions", () => {
        expect(() =>
            Workflow.validate({
                workflow_id: "",
                workflow_name: "n",
                workflow_version: "1",
                metadata: {},
                inputs: {},
                outputs: {},
                variables: {},
                pipeline: [{ id: "a", dependencies: [] }],
                execution_policy: {},
            })
        ).toThrow(WorkflowValidationError);
    });

    test("contains no runtime execution methods", () => {
        const w = new WorkflowBuilder()
            .id("wf")
            .name("n")
            .version("1")
            .addStep({ id: "a", dependencies: [] })
            .build();
        expect((w as unknown as { execute?: unknown }).execute).toBeUndefined();
        expect((w as unknown as { dispatch?: unknown }).dispatch).toBeUndefined();
    });
});
