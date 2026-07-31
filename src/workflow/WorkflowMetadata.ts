/**
 * Declarative metadata for a Workflow definition.
 */
export interface WorkflowMetadata {
    readonly description?: string;
    readonly tags?: readonly string[];
    readonly owner?: string;
    readonly attributes?: Readonly<Record<string, unknown>>;
}

export function freezeMetadata(metadata: WorkflowMetadata): Readonly<WorkflowMetadata> {
    return Object.freeze({
        description: metadata.description,
        tags: metadata.tags ? Object.freeze([...metadata.tags]) : undefined,
        owner: metadata.owner,
        attributes: metadata.attributes
            ? Object.freeze({ ...metadata.attributes })
            : undefined,
    });
}
