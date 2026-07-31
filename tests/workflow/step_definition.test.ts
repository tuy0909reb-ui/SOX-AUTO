import { StepDefinition } from "../../src/workflow/StepDefinition";
import { InvalidStepDefinitionError } from "../../src/workflow/WorkflowBuildError";

describe("StepDefinition", () => {
    test("creates immutable StepDefinition preserving identity", () => {
        const step = StepDefinition.create({
            id: "s1",
            priority: 3,
            input: { type: "t", payload: { a: 1 }, metadata: { k: "v" } },
        });
        expect(step.id).toBe("s1");
        expect(step.priority).toBe(3);
        expect(Object.isFrozen(step)).toBe(true);
        expect(() => {
            (step as { id: string }).id = "mutated";
        }).toThrow(TypeError);
        expect(step.id).toBe("s1");
    });

    test("fails on invalid StepDefinition", () => {
        expect(() => StepDefinition.create({ id: "" })).toThrow(InvalidStepDefinitionError);
        expect(() => StepDefinition.create({ id: "  " })).toThrow(InvalidStepDefinitionError);
        expect(() =>
            StepDefinition.create({ id: "x", priority: Number.NaN })
        ).toThrow(InvalidStepDefinitionError);
        expect(() =>
            StepDefinition.create({ id: "x", input: { type: "", payload: null } })
        ).toThrow(InvalidStepDefinitionError);
    });
});
