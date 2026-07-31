import { DependencyResolver } from "../../src/orchestration/DependencyResolver";
import { GraphBuilder } from "../../src/orchestration/GraphBuilder";

describe("DependencyResolver", () => {
    const graph = GraphBuilder.build({
        nodes: [
            { id: "a", dependencies: [] },
            { id: "b", dependencies: ["a"] },
            { id: "c", dependencies: ["a"] },
        ],
    });
    const resolver = new DependencyResolver();

    test("validates satisfied dependencies", () => {
        expect(() =>
            resolver.validate(new Set(["b", "c"]), graph, new Set(["a"]))
        ).not.toThrow();
    });

    test("rejects unsatisfied dependencies", () => {
        expect(() =>
            resolver.validate(new Set(["b"]), graph, new Set())
        ).toThrow(/Dependency not satisfied/);
    });

    test("SHALL NOT generate ExecutableNodeSet — only orders given set", () => {
        const ordered = resolver.topologicalOrder(new Set(["c", "b"]), graph);
        expect(ordered.sort()).toEqual(["b", "c"]);
        expect(ordered).not.toContain("a");
    });
});
