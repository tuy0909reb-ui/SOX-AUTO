import { ExecutionGraphNode } from "../orchestration/ExecutionGraph";
import { StepDefinition } from "./StepDefinition";

/**
 * Converts StepDefinition → exactly one Node.
 * Preserves Step identity. Does not embed execution semantics.
 */
export class NodeFactory {
    /**
     * @param dependencies dependency NodeIDs (from EdgeFactory), deterministic order expected
     */
    static create(step: StepDefinition, dependencies: readonly string[] = []): ExecutionGraphNode {
        return Object.freeze({
            id: step.id,
            dependencies: Object.freeze([...dependencies]),
            input: Object.freeze({
                type: step.input?.type ?? "default",
                payload: step.input?.payload ?? null,
                metadata: Object.freeze({
                    ...(step.input?.metadata ?? {}),
                    ...(step.priority !== undefined ? { priority: step.priority } : {}),
                    stepId: step.id,
                }),
            }),
        });
    }
}
