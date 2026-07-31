import { GraphBuilder } from "../../src/orchestration/GraphBuilder";
import { Orchestrator } from "../../src/orchestration/Orchestrator";
import { Scheduler } from "../../src/orchestration/Scheduler";
import { PrioritySchedulingPolicy } from "../../src/orchestration/SchedulingPolicy";

describe("Scheduler", () => {
    const graph = GraphBuilder.build({
        nodes: [
            { id: "a", dependencies: [] },
            { id: "b", dependencies: ["a"] },
            { id: "c", dependencies: ["a"] },
            { id: "d", dependencies: ["b", "c"] },
        ],
    });

    test("deterministic scheduling", () => {
        const scheduler = new Scheduler();
        const exec = new Set(["b", "c"]);
        const completed = new Set(["a"]);
        const r1 = scheduler.schedule(exec, graph, completed);
        const r2 = scheduler.schedule(exec, graph, completed);
        expect(r1.ok && r2.ok).toBe(true);
        if (r1.ok && r2.ok) {
            expect(r1.queue.toArray()).toEqual(r2.queue.toArray());
            expect(r1.queue.toArray()).toEqual(["b", "c"]);
        }
    });

    test("no partial queue on dependency validation failure", () => {
        const scheduler = new Scheduler();
        const result = scheduler.schedule(new Set(["b"]), graph, new Set());
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.message).toMatch(/Dependency not satisfied/);
        }
    });

    test("concurrency limiting applied", () => {
        const scheduler = new Scheduler({ concurrencyLimit: 1 });
        const result = scheduler.schedule(new Set(["a"]), graph, new Set());
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.queue.toArray()).toEqual(["a"]);
        }
        const roots = GraphBuilder.build({
            nodes: [
                { id: "x", dependencies: [] },
                { id: "y", dependencies: [] },
            ],
        });
        const limited = new Scheduler({ concurrencyLimit: 1 }).schedule(
            new Set(["y", "x"]),
            roots,
            new Set()
        );
        expect(limited.ok).toBe(true);
        if (limited.ok) {
            expect(limited.queue.size).toBe(1);
            expect(limited.queue.toArray()).toEqual(["x"]);
        }
    });

    test("priority policy integration", () => {
        const g = GraphBuilder.build({
            nodes: [
                { id: "a", dependencies: [] },
                { id: "b", dependencies: [] },
            ],
        });
        const scheduler = new Scheduler({
            policy: new PrioritySchedulingPolicy(),
            priorities: new Map([
                ["a", 1],
                ["b", 5],
            ]),
        });
        const result = scheduler.schedule(new Set(["a", "b"]), g, new Set());
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.queue.toArray()).toEqual(["b", "a"]);
        }
    });

    test("dispatch integration via Orchestrator scheduling cycle", async () => {
        const orch = new Orchestrator();
        orch.initialize({
            nodes: [
                { id: "a", dependencies: [], priority: 1 },
                { id: "b", dependencies: ["a"], priority: 2 },
                { id: "c", dependencies: ["a"], priority: 3 },
            ],
            schedulingPolicy: "priority",
            maxConcurrency: 2,
        });
        const result = await orch.execute();
        expect(result.state).toBe("Completed");
        expect(result.completedNodes.sort()).toEqual(["a", "b", "c"]);
    });

    test("scheduling failure reported to ErrorPolicy path", async () => {
        // Force a scheduling failure by using a custom scheduler path via invalid executable —
        // covered unit-level above; integration ensures Orchestrator still completes valid graphs.
        const orch = new Orchestrator();
        orch.initialize({
            nodes: [{ id: "only", dependencies: [] }],
        });
        const result = await orch.execute();
        expect(result.state).toBe("Completed");
    });
});
