import { Dispatcher } from "../../src/orchestration/Dispatcher";
import { ExecutionGraph } from "../../src/orchestration/ExecutionGraph";
import { GraphBuilder } from "../../src/orchestration/GraphBuilder";
import { GraphValidator } from "../../src/orchestration/GraphValidator";

describe("Dispatcher and ExecutionGraph immutability", () => {
    const graph = GraphBuilder.build({
        nodes: [
            { id: "a", dependencies: [] },
            { id: "b", dependencies: ["a"] },
            { id: "c", dependencies: ["a"] },
            { id: "d", dependencies: ["b", "c"] },
        ],
    });

    test("Dispatcher selects roots when nothing completed", () => {
        const dispatcher = new Dispatcher();
        const executable = dispatcher.selectExecutableNodes(new Set(), graph);
        expect([...executable].sort()).toEqual(["a"]);
    });

    test("Dispatcher selects dependents after completion", () => {
        const dispatcher = new Dispatcher();
        const afterA = dispatcher.selectExecutableNodes(new Set(["a"]), graph);
        expect([...afterA].sort()).toEqual(["b", "c"]);
        const afterBC = dispatcher.selectExecutableNodes(new Set(["a", "b", "c"]), graph);
        expect([...afterBC].sort()).toEqual(["d"]);
    });

    test("Dispatcher SHALL NOT mutate ExecutionGraph", () => {
        const dispatcher = new Dispatcher();
        const before = graph.nodeIds.join(",");
        dispatcher.selectExecutableNodes(new Set(["a"]), graph);
        expect(graph.nodeIds.join(",")).toBe(before);
        expect(Object.isFrozen(graph)).toBe(true);
        expect(Object.isFrozen(graph.getNode("a"))).toBe(true);
    });

    test("ExecutionGraph nodes/edges immutable after construction", () => {
        const node = graph.getNode("a")!;
        expect(() => {
            (node as { id: string }).id = "mutated";
        }).toThrow();
        expect(() => {
            (node.dependencies as NodeIDWritable).push("x");
        }).toThrow();
    });

    test("read-only graph enforcement for internal selection", () => {
        const frozen = new ExecutionGraph([
            {
                id: "x",
                dependencies: [],
                input: { type: "t", payload: null, metadata: {} },
            },
        ]);
        GraphValidator.validate(frozen);
        const dispatcher = new Dispatcher();
        const set = dispatcher.selectExecutableNodes(new Set(), frozen);
        expect(set.has("x")).toBe(true);
        expect(Object.isFrozen(frozen)).toBe(true);
    });
});

type NodeIDWritable = string[];
