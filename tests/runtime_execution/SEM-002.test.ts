import * as fs from "fs";
import * as path from "path";
import { DefaultExecutionContext } from "../../src/runtime_execution/ExecutionContext";
import { DefaultExecutionEngine } from "../../src/runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../../src/runtime_execution/ExecutionLayerInput";

/**
 * SEM-002 Pipeline と Scheduler の意味論は保持される
 * Mapping: Section 8 Semantic Equivalence
 */
describe("SEM-002", () => {
    test("SEM-002", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        const sources = fs
            .readdirSync(runtimeExecutionDir)
            .filter((name) => name.endsWith(".ts"))
            .map((name) => fs.readFileSync(path.join(runtimeExecutionDir, name), "utf8"));

        for (const body of sources) {
            expect(body).not.toMatch(
                /from\s+["'][^"']*(runtime_pipeline|runtime_scheduler|PipelineCoordinator)[^"']*["']/
            );
            expect(body).not.toMatch(/\b(modifyPipeline|reorderSchedule|setScheduleOrder)\b/);
        }

        const pipelineSteps = ["validate", "execute", "commit"];
        const schedulerOrder = ["job-a", "job-b"];
        const snapshotPipeline = [...pipelineSteps];
        const snapshotSchedule = [...schedulerOrder];

        const engine = new DefaultExecutionEngine();
        const context = new DefaultExecutionContext(
            { pipelineSteps, schedulerOrder },
            {}
        );
        const input: ExecutionLayerInput = {
            type: "sem-002",
            payload: { touchPipeline: true },
            metadata: {},
        };

        engine.execute(context, input);

        expect(pipelineSteps).toEqual(snapshotPipeline);
        expect(schedulerOrder).toEqual(snapshotSchedule);
        expect(context.runtimeState).toEqual({
            pipelineSteps: snapshotPipeline,
            schedulerOrder: snapshotSchedule,
        });
    });
});
