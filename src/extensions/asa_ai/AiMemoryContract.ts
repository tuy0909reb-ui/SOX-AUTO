/**
 * ASA-ARCH-38.0 - AI Memory / Learning / Input-Output Boundaries (Draft 0.5)
 *
 * Memory ≠ Core State. Learning ≠ Architecture Mutation.
 */

/** Memory layer kinds. */
export type AiMemoryLayerKind =
    | "WORKING_MEMORY"
    | "SESSION_MEMORY"
    | "PERSISTENT_MEMORY";

/**
 * AI Memory Boundary Contract.
 */
export interface AiMemoryContract {
    readonly memoryContractId: string;
    readonly layers: ReadonlyArray<AiMemoryLayerKind>;
    readonly neverPartOfCoreState: true;
    readonly ownershipExplicitlyDeclared: true;
    readonly ownershipValidatedByGovernance: true;
    readonly sessionMemoryEphemeral: true;
    readonly workingMemoryScoped: true;
    readonly persistentMemoryGovernedByPolicy: true;
}

/** Learning update kinds. */
export type AiLearningKind =
    | "PROMPT_UPDATE"
    | "KNOWLEDGE_UPDATE"
    | "MODEL_UPDATE"
    | "FEEDBACK_LEARNING"
    | "RETRAINING"
    | "EVALUATION_FEEDBACK";

/**
 * AI Learning Boundary Contract.
 */
export interface AiLearningBoundary {
    readonly learningBoundaryId: string;
    readonly learningKinds: ReadonlyArray<AiLearningKind>;
    readonly forbidsCoreContractsMutation: true;
    readonly forbidsGovernanceContractsMutation: true;
    readonly forbidsFrameworkContractsMutation: true;
    readonly forbidsFrozenExtensionsMutation: true;
}

/** Allowed AI input kinds. */
export type AiInputKind =
    | "OBSERVATION_DATA_OPS"
    | "EXTERNAL_DATA_CONNECT"
    | "STATIC_KNOWLEDGE"
    | "HUMAN_INPUT"
    | "GOVERNANCE_INPUT_SNAPSHOT";

/** Allowed AI output kinds. */
export type AiOutputKind =
    | "PROPOSAL"
    | "RECOMMENDATION"
    | "SUMMARY"
    | "EVALUATION"
    | "EXPLANATION"
    | "CLARIFICATION_REQUEST";

/**
 * AI Input / Output Boundary Contract.
 */
export interface AiInputOutputBoundary {
    readonly boundaryId: string;
    readonly allowedInputs: ReadonlyArray<AiInputKind>;
    readonly allowedOutputs: ReadonlyArray<AiOutputKind>;
    readonly governanceSnapshotIsReferenceOnly: true;
    readonly governanceSnapshotGrantsNoAuthority: true;
    readonly governanceSnapshotImmutable: true;
    readonly forbidsDirectRuntimeState: true;
    readonly forbidsDirectCapabilityState: true;
    readonly forbidsDirectPolicyState: true;
    readonly forbidsExecutionCommandOutput: true;
    readonly forbidsPolicyMutationOutput: true;
    readonly forbidsRuntimeMutationOutput: true;
}

export function freezeAiMemoryContract(
    contract: AiMemoryContract
): AiMemoryContract {
    return Object.freeze({
        ...contract,
        layers: Object.freeze([...contract.layers]),
    });
}

export function freezeAiLearningBoundary(
    boundary: AiLearningBoundary
): AiLearningBoundary {
    return Object.freeze({
        ...boundary,
        learningKinds: Object.freeze([...boundary.learningKinds]),
    });
}

export function freezeAiInputOutputBoundary(
    boundary: AiInputOutputBoundary
): AiInputOutputBoundary {
    return Object.freeze({
        ...boundary,
        allowedInputs: Object.freeze([...boundary.allowedInputs]),
        allowedOutputs: Object.freeze([...boundary.allowedOutputs]),
    });
}
