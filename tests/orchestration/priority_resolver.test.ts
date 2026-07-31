import { PriorityResolver } from "../../src/orchestration/PriorityResolver";

describe("PriorityResolver", () => {
    const resolver = new PriorityResolver();

    test("higher priority schedules earlier", () => {
        const topo = ["a", "b", "c"];
        const priorities = new Map([
            ["a", 1],
            ["b", 3],
            ["c", 2],
        ]);
        expect(resolver.orderByPriority(topo, priorities)).toEqual(["b", "c", "a"]);
    });

    test("equal priority preserves topological order", () => {
        const topo = ["a", "b", "c"];
        const priorities = new Map([
            ["a", 1],
            ["b", 1],
            ["c", 1],
        ]);
        expect(resolver.orderByPriority(topo, priorities)).toEqual(["a", "b", "c"]);
    });

    test("does not mutate priority map", () => {
        const priorities = new Map([["a", 5]]);
        const before = priorities.get("a");
        resolver.orderByPriority(["a"], priorities);
        expect(priorities.get("a")).toBe(before);
    });
});
