import { InvalidStepDefinitionError } from "./WorkflowBuildError";

/**
 * Declarative step — converted to exactly one Node.
 * SHALL NOT embed execution semantics.
 */
export class StepDefinition {
    readonly id: string;
    readonly priority?: number;
    readonly input?: Readonly<{
        type: string;
        payload: unknown;
        metadata?: Readonly<Record<string, unknown>>;
    }>;

    private constructor(
        id: string,
        priority: number | undefined,
        input:
            | Readonly<{
                  type: string;
                  payload: unknown;
                  metadata?: Readonly<Record<string, unknown>>;
              }>
            | undefined
    ) {
        this.id = id;
        this.priority = priority;
        this.input = input;
        Object.freeze(this);
    }

    /**
     * Create and validate a StepDefinition. Fails if invalid.
     */
    static create(params: {
        id: string;
        priority?: number;
        input?: {
            type: string;
            payload: unknown;
            metadata?: Record<string, unknown>;
        };
    }): StepDefinition {
        if (!params.id || params.id.trim() === "") {
            throw new InvalidStepDefinitionError("StepDefinition.id is required");
        }
        if (params.id.includes("\0")) {
            throw new InvalidStepDefinitionError("StepDefinition.id contains illegal character");
        }
        if (params.priority !== undefined && !Number.isFinite(params.priority)) {
            throw new InvalidStepDefinitionError("StepDefinition.priority must be finite");
        }
        if (params.input && (!params.input.type || params.input.type.trim() === "")) {
            throw new InvalidStepDefinitionError("StepDefinition.input.type is required when input is set");
        }

        const input = params.input
            ? Object.freeze({
                  type: params.input.type,
                  payload: params.input.payload,
                  metadata: params.input.metadata
                      ? Object.freeze({ ...params.input.metadata })
                      : undefined,
              })
            : undefined;

        return new StepDefinition(params.id, params.priority, input);
    }
}
