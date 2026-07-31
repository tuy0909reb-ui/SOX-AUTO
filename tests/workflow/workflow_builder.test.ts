import { WorkflowBuilder } from "../../src/workflow/WorkflowBuilder";
import { PipelineDefinition } from "../../src/workflow/PipelineDefinition";
import { StepDefinition } from "../../src/workflow/StepDefinition";
import { WorkflowBuildError, InvalidStepDefinitionError } from "../../src/workflow/WorkflowBuildError";

describe("WorkflowBuilder (21.0 definition + 21.1 conversion)", () => {
    test("builds validated immutable Workflow", () => {
        const w = new WorkflowBuilder()
            .id("wf-b")
            .name("Builder")
            .version("0.1.0")
            .withMetadata({ description: "demo", tags: ["t1"] })
            .withInputs({ x: 1 })
            .withOutputs({ y: 2 })
            .withVariables({ z: 3 })
            .withExecutionPolicy({ errorPolicy: "STOP_ON_ERROR", maxConcurrency: 2 })
            .addStep({ id: "a", dependencies: [] })
            .addStep({
                id: "b",
                dependencies: ["a"],
                priority: 5,
                input: { type: "t", payload: { v: 1 } },
            })
            .build();

        expect(w.pipeline.map((s) => s.id)).toEqual(["a", "b"]);
        expect(w.inputs).toEqual({ x: 1 });
        expect(w.execution_policy.maxConcurrency).toBe(2);
        expect(w.workflow_state).toBe("Immutable");
    });

    test("buildDefinition returns raw Created definition without freezing lifecycle", () => {
        const def = new WorkflowBuilder()
            .id("wf")
            .name("n")
            .version("1")
            .addStep({ id: "a", dependencies: [] })
            .buildDefinition();
        expect(def.workflow_id).toBe("wf");
        expect(def.pipeline).toHaveLength(1);
    });

    test("treats Workflow as read-only during graph build", () => {
        const w = new WorkflowBuilder()
            .id("wf-ro")
            .name("RO")
            .version("1")
            .addSequence([
                { id: "A" },
                { id: "B" },
                { id: "C" },
            ])
            .build();

        const idBefore = w.workflow_id;
        const pipelineBefore = w.pipeline.map((s) => ({
            id: s.id,
            dependencies: [...s.dependencies],
        }));
        const graph = WorkflowBuilder.buildExecutionGraph(w);
        expect(graph.size).toBe(3);
        expect(w.workflow_id).toBe(idBefore);
        expect(
            w.pipeline.map((s) => ({ id: s.id, dependencies: [...s.dependencies] }))
        ).toEqual(pipelineBefore);
        expect(Object.isFrozen(w)).toBe(true);
        expect(w.workflow_state).toBe("Ready");
    });

    test("identical Workflow → identical ExecutionGraph (deterministic)", () => {
        const make = () =>
            new WorkflowBuilder()
                .id("wf-det")
                .name("Det")
                .version("1")
                .addStep({ id: "b", dependencies: ["a"] })
                .addStep({ id: "a", dependencies: [] })
                .addStep({ id: "c", dependencies: ["a", "b"] })
                .build();

        const g1 = WorkflowBuilder.buildExecutionGraph(make());
        const g2 = WorkflowBuilder.buildExecutionGraph(make());
        expect([...g1.nodeIds]).toEqual([...g2.nodeIds]);
        for (const id of g1.nodeIds) {
            expect(g1.getNode(id)?.dependencies).toEqual(g2.getNode(id)?.dependencies);
        }
    });

    test("generates globally unique NodeIDs and exactly-once Step conversion", () => {
        const w = new WorkflowBuilder()
            .id("wf-uniq")
            .name("U")
            .version("1")
            .addParallel([{ id: "p1" }, { id: "p2" }, { id: "p3" }])
            .build();
        const g = WorkflowBuilder.buildExecutionGraph(w);
        expect(g.size).toBe(3);
        expect(new Set(g.nodeIds).size).toBe(g.nodeIds.length);
        expect([...g.nodeIds].sort()).toEqual(["p1", "p2", "p3"]);
    });

    test("sequence / parallel / branch edge semantics via PipelineDefinition", () => {
        const seq = PipelineDefinition.sequence([
            StepDefinition.create({ id: "A" }),
            StepDefinition.create({ id: "B" }),
            StepDefinition.create({ id: "C" }),
        ]);
        const gSeq = WorkflowBuilder.buildExecutionGraphFromPipeline(seq);
        expect(gSeq.getNode("B")?.dependencies).toEqual(["A"]);
        expect(gSeq.getNode("C")?.dependencies).toEqual(["B"]);
        expect(gSeq.getNode("A")?.dependencies).toEqual([]);

        const par = PipelineDefinition.parallel([
            StepDefinition.create({ id: "A" }),
            StepDefinition.create({ id: "B" }),
            StepDefinition.create({ id: "C" }),
        ]);
        const gPar = WorkflowBuilder.buildExecutionGraphFromPipeline(par);
        expect(gPar.getNode("A")?.dependencies).toEqual([]);
        expect(gPar.getNode("B")?.dependencies).toEqual([]);
        expect(gPar.getNode("C")?.dependencies).toEqual([]);

        const br = PipelineDefinition.branch(StepDefinition.create({ id: "Cond" }), [
            StepDefinition.create({ id: "A" }),
            StepDefinition.create({ id: "B" }),
        ]);
        const gBr = WorkflowBuilder.buildExecutionGraphFromPipeline(br);
        expect(gBr.getNode("A")?.dependencies).toEqual(["Cond"]);
        expect(gBr.getNode("B")?.dependencies).toEqual(["Cond"]);
    });

    test("invalid StepDefinition fails; Workflow unchanged; no partial graph", () => {
        expect(() => StepDefinition.create({ id: "" })).toThrow(InvalidStepDefinitionError);

        const w = new WorkflowBuilder()
            .id("wf-fail")
            .name("Fail")
            .version("1")
            .addStep({ id: "a", dependencies: ["b"] })
            .addStep({ id: "b", dependencies: ["a"] })
            .build();
        const stateBefore = w.workflow_state;
        const pipelineBefore = w.pipeline.map((s) => s.id).join(",");

        expect(() => WorkflowBuilder.buildExecutionGraph(w)).toThrow(WorkflowBuildError);
        expect(w.workflow_state).toBe(stateBefore);
        expect(w.pipeline.map((s) => s.id).join(",")).toBe(pipelineBefore);
        expect(Object.isFrozen(w)).toBe(true);
    });

    test("PipelineDefinition treated as read-only", () => {
        const p = PipelineDefinition.sequence([
            StepDefinition.create({ id: "A" }),
            StepDefinition.create({ id: "B" }),
        ]);
        const edgesBefore = [...p.edges];
        WorkflowBuilder.buildExecutionGraphFromPipeline(p);
        expect(p.edges).toEqual(edgesBefore);
        expect(Object.isFrozen(p)).toBe(true);
    });
});
