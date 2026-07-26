import {
    InvalidLifecycleTransitionError,
    LifecycleController,
} from "../../src/orchestration/LifecycleController";
import { Orchestrator } from "../../src/orchestration/Orchestrator";
import { RuntimePlan } from "../../src/orchestration/types";

describe("LifecycleController / Orchestrator lifecycle", () => {
    const validPlan: RuntimePlan = {
        nodes: [{ id: "a", dependencies: [] }],
    };

    test("valid transitions: Created → Ready → Running → Completed", async () => {
        const orch = new Orchestrator();
        expect(orch.state).toBe("Created");
        orch.initialize(validPlan);
        expect(orch.state).toBe("Ready");
        const result = await orch.execute();
        expect(result.state).toBe("Completed");
        orch.shutdown();
        expect(orch.state).toBe("Shutdown");
    });

    test("invalid transitions are rejected", () => {
        const lc = new LifecycleController();
        expect(() => lc.transition("START_EXECUTE")).toThrow(InvalidLifecycleTransitionError);
        expect(() => lc.transition("COMPLETE")).toThrow(InvalidLifecycleTransitionError);
        expect(() => lc.transition("MARK_READY")).toThrow(InvalidLifecycleTransitionError);
        lc.transition("INITIALIZE_SUCCESS");
        expect(lc.state).toBe("Initialized");
        expect(() => lc.transition("START_EXECUTE")).toThrow(InvalidLifecycleTransitionError);
    });

    test("initialize only from Created; Failed re-init prohibited", () => {
        const orch = new Orchestrator();
        expect(() =>
            orch.initialize({
                nodes: [
                    { id: "a", dependencies: ["missing"] },
                ],
            })
        ).toThrow();
        expect(orch.state).toBe("Failed");
        expect(() => orch.initialize(validPlan)).toThrow(/Created/);
    });

    test("execute only once from Ready", async () => {
        const orch = new Orchestrator();
        orch.initialize(validPlan);
        await orch.execute();
        await expect(orch.execute()).rejects.toThrow(/once|Ready/i);
    });

    test("shutdown is idempotent", () => {
        const orch = new Orchestrator();
        orch.initialize(validPlan);
        orch.shutdown();
        orch.shutdown();
        expect(orch.state).toBe("Shutdown");
    });

    test("lifecycle bypass prevented — FAIL only via LifecycleController", () => {
        const lc = new LifecycleController();
        lc.transition("INITIALIZE_SUCCESS");
        lc.transition("MARK_READY");
        lc.transition("START_EXECUTE");
        expect(lc.transition("FAIL")).toBe("Failed");
    });
});
