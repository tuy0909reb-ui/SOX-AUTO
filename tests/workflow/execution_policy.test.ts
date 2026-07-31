import { ExecutionPolicyView, freezeExecutionPolicy } from "../../src/workflow/ExecutionPolicy";

describe("ExecutionPolicy", () => {
    test("declares behavior only — frozen declarative view", () => {
        const policy = freezeExecutionPolicy({
            errorPolicy: "CONTINUE",
            schedulingPolicy: "priority",
            maxConcurrency: 3,
            retryDeclared: true,
            timeoutDeclared: true,
        });
        expect(Object.isFrozen(policy)).toBe(true);
        const view = new ExecutionPolicyView(policy);
        expect(view.declared.retryDeclared).toBe(true);
        expect((view as unknown as { execute?: unknown }).execute).toBeUndefined();
        expect((view as unknown as { control?: unknown }).control).toBeUndefined();
    });
});
