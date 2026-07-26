import { ExternalRuntimeState, ExecutionInternalState } from "./types";

export class DefaultExecutionContext {
    readonly runtimeState: Readonly<ExternalRuntimeState>;
    readonly internalState: Readonly<ExecutionInternalState>;

    constructor(runtimeState: ExternalRuntimeState, internalState: ExecutionInternalState) {
        this.runtimeState = Object.freeze({ ...runtimeState });
        this.internalState = Object.freeze({ ...internalState });
    }
}