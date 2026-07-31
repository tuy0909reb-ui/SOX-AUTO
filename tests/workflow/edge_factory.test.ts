import { EdgeFactory } from "../../src/workflow/EdgeFactory";
import { PipelineDefinition } from "../../src/workflow/PipelineDefinition";
import { StepDefinition } from "../../src/workflow/StepDefinition";

describe("EdgeFactory", () => {
    test("generates edges solely from PipelineDefinition semantics", () => {
        const seq = PipelineDefinition.sequence([
            StepDefinition.create({ id: "A" }),
            StepDefinition.create({ id: "B" }),
            StepDefinition.create({ id: "C" }),
        ]);
        expect(EdgeFactory.fromPipeline(seq)).toEqual(seq.edges);

        const par = PipelineDefinition.parallel([
            StepDefinition.create({ id: "A" }),
            StepDefinition.create({ id: "B" }),
        ]);
        expect(EdgeFactory.fromPipeline(par)).toEqual([]);
    });

    test("toDependencyMap is deterministic", () => {
        const edges = [
            { from: "A", to: "C" },
            { from: "B", to: "C" },
        ];
        const map1 = EdgeFactory.toDependencyMap(["A", "B", "C"], edges);
        const map2 = EdgeFactory.toDependencyMap(["A", "B", "C"], edges);
        expect(map1.get("C")).toEqual(["A", "B"]);
        expect(map2.get("C")).toEqual(["A", "B"]);
        expect(map1.get("A")).toEqual([]);
    });
});
