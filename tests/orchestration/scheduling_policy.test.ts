import { DependencyResolver } from "../../src/orchestration/DependencyResolver";
import { GraphBuilder } from "../../src/orchestration/GraphBuilder";
import {
    FifoSchedulingPolicy,
    PrioritySchedulingPolicy,
} from "../../src/orchestration/SchedulingPolicy";

describe("SchedulingPolicy", () => {
    const graph = GraphBuilder.build({
        nodes: [
            { id: "a", dependencies: [] },
            { id: "b", dependencies: [] },
            { id: "c", dependencies: [] },
        ],
    });
    const deps = new DependencyResolver();

    test("FIFO is deterministic", () => {
        const fifo = new FifoSchedulingPolicy();
        const exec = new Set(["c", "a", "b"]);
        const r1 = fifo.order(exec, graph, deps, new Map());
        const r2 = fifo.order(exec, graph, deps, new Map());
        expect(r1).toEqual(r2);
        expect(r1).toEqual(["a", "b", "c"]);
    });

    test("Priority ordering with stable tie-break", () => {
        const policy = new PrioritySchedulingPolicy();
        const exec = new Set(["a", "b", "c"]);
        const priorities = new Map([
            ["a", 1],
            ["b", 2],
            ["c", 2],
        ]);
        // b and c equal priority → topo/NodeID order among equals (a,b,c topo → b before c)
        expect(policy.order(exec, graph, deps, priorities)).toEqual(["b", "c", "a"]);
    });

    test("policy does not inspect EnginePool (no EnginePool import usage)", () => {
        const fs = require("fs") as typeof import("fs");
        const path = require("path") as typeof import("path");
        const body = fs.readFileSync(
            path.resolve(__dirname, "../../src/orchestration/SchedulingPolicy.ts"),
            "utf8"
        );
        const imports = [...body.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
        expect(imports.some((i) => i.includes("EnginePool"))).toBe(false);
        expect(body).toMatch(/SHALL NOT inspect EnginePool state/);
    });
});
