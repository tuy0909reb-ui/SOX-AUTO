/**
 * Failure contract errors for ASA-ARCH-21.1 WorkflowBuilder.
 */
export class WorkflowBuildError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkflowBuildError";
    }
}

export class InvalidStepDefinitionError extends WorkflowBuildError {
    constructor(message: string) {
        super(message);
        this.name = "InvalidStepDefinitionError";
    }
}
