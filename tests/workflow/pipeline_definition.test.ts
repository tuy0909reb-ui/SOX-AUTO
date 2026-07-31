import { PipelineDefinition } from "../../src/workflow/PipelineDefinition";
import { StepDefinition } from "../../src/workflow/StepDefinition";
import { WorkflowBuildError } from "../../src/workflow/WorkflowBuildError";

const A = () => StepDefinition.create({ id: "A" });
const B = () => StepDefinition.create({ id: "B" });
const C = () => StepDefinition.create({ id: "C" });
const Cond = () => StepDefinition.create({ id: "Cond" });

describe("PipelineDefinition", () => {
    test("sequence generates A→B, B→C edges", () => {
        const p = PipelineDefinition.sequence([A(), B(), C()]);
        expect(p.kind).toBe("sequence");
        expect(p.edges).toEqual([
            { from: "A", to: "B" },
            { from: "B", to: "C" },
        ]);
        expect(Object.isFrozen(p)).toBe(true);
    });

    test("parallel generates no dependency edges", () => {
        const p = PipelineDefinition.parallel([A(), B(), C()]);
        expect(p.kind).toBe("parallel");
        expect(p.edges).toEqual([]);
    });

    test("branch generates Cond→A, Cond→B only (no execution semantics)", () => {
        const p = PipelineDefinition.branch(Cond(), [A(), B()]);
        expect(p.kind).toBe("branch");
        expect(p.edges).toEqual([
            { from: "Cond", to: "A" },
            { from: "Cond", to: "B" },
        ]);
        expect(p.steps.map((s) => s.id)).toEqual(["Cond", "A", "B"]);
    });

    test("fromWorkflowSteps is deterministic and read-only", () => {
        const steps = [
            { id: "b", dependencies: ["a"], priority: 1 },
            { id: "a", dependencies: [] },
        ];
        const p1 = PipelineDefinition.fromWorkflowSteps(steps);
        const p2 = PipelineDefinition.fromWorkflowSteps(steps);
        expect(p1.edges).toEqual(p2.edges);
        expect(p1.edges).toEqual([{ from: "a", to: "b" }]);
        expect(Object.isFrozen(p1)).toBe(true);
        expect(Object.isFrozen(p1.steps)).toBe(true);
    });

    test("rejects duplicate step ids", () => {
        expect(() => PipelineDefinition.sequence([A(), A()])).toThrow(WorkflowBuildError);
    });
});
