import { NodeFactory } from "../../src/workflow/NodeFactory";
import { StepDefinition } from "../../src/workflow/StepDefinition";

describe("NodeFactory", () => {
    test("converts StepDefinition into exactly one Node preserving identity", () => {
        const step = StepDefinition.create({
            id: "step-x",
            priority: 7,
            input: { type: "job", payload: { n: 1 } },
        });
        const node = NodeFactory.create(step, ["dep1"]);
        expect(node.id).toBe("step-x");
        expect(node.dependencies).toEqual(["dep1"]);
        expect(node.input.metadata.stepId).toBe("step-x");
        expect(node.input.metadata.priority).toBe(7);
        expect(Object.isFrozen(node)).toBe(true);
    });

    test("does not embed execution semantics beyond identity/input", () => {
        const step = StepDefinition.create({ id: "n" });
        const node = NodeFactory.create(step);
        const keys = Object.keys(node).sort();
        expect(keys).toEqual(["dependencies", "id", "input"]);
        expect(node).not.toHaveProperty("engine");
        expect(node).not.toHaveProperty("retry");
        expect(node).not.toHaveProperty("schedule");
    });
});
