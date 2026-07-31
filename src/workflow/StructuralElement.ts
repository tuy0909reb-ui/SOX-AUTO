/**
 * ASA-ARCH-21.2 Chapter 2 — Recognized Structural Elements (Draft 0.2)
 *
 * Declarative structural shapes only.
 * SHALL NOT expand, validate, evaluate conditions, or execute.
 */

/** PD-2 initial recognized structural element kinds. */
export type RecognizedStructuralElementKind =
    | "Sequence"
    | "Parallel"
    | "Branch"
    | "Merge"
    | "NestedPipeline";

export const RECOGNIZED_STRUCTURAL_ELEMENTS: readonly RecognizedStructuralElementKind[] =
    Object.freeze(["Sequence", "Parallel", "Branch", "Merge", "NestedPipeline"]);

/**
 * Opaque Condition Identifier (PD-5).
 * Identifies a structural conditional path; SHALL NOT be evaluated here.
 */
export type ConditionIdentifier = string;

/** Structural element reference — recursive definition shape only. */
export type StructuralElement =
    | SequenceElement
    | ParallelElement
    | BranchElement
    | MergeElement
    | NestedPipelineElement
    | StepRefElement;

/** StepDefinition reference (21.0) — identity only, no execution payload required at contract layer. */
export interface StepRefElement {
    readonly kind: "StepRef";
    readonly stepId: string;
}

export interface SequenceElement {
    readonly kind: "Sequence";
    /** Deterministic ordered list; emptiness is a validity concern (PD-13), not enforced here. */
    readonly elements: readonly StructuralElement[];
}

export interface ParallelElement {
    readonly kind: "Parallel";
    /** Deterministic set of concurrently eligible branches (structure only). */
    readonly branches: readonly StructuralElement[];
}

export interface BranchPath {
    readonly conditionId: ConditionIdentifier;
    readonly path: StructuralElement;
}

export interface BranchElement {
    readonly kind: "Branch";
    /** Structural paths identified by Condition Identifier — not evaluated. */
    readonly paths: readonly BranchPath[];
}

export interface MergeElement {
    readonly kind: "Merge";
    /** Structural convergence; requires ≥2 inputs per PD-6 (validity in Ch5 / validation chapter). */
    readonly inputs: readonly StructuralElement[];
}

export interface NestedPipelineElement {
    readonly kind: "NestedPipeline";
    /**
     * Embedded PipelineDefinition structure (recursive).
     * Unexpanded; expansion is Chapter 3 responsibility.
     */
    readonly pipeline: PipelineDefinitionStructure;
}

/**
 * Public structural shape of a PipelineDefinition (Definition Object).
 * Not the 21.1 WorkflowBuilder helper class — contract-level structure only.
 */
export interface PipelineDefinitionStructure {
    readonly root: StructuralElement;
}

/** Composition forbidden by PD-8 (boundary documentation only). */
export const PD8_FORBIDDEN_COMPOSITION = Object.freeze([
    "Runtime object",
    "Engine",
    "Scheduler",
    "DispatchStrategy",
    "ExecutionGraph",
    "Workflow instance",
    "Runtime data",
] as const);

/** Invalid-structure categories named by PD-13 (no failure handling implementation). */
export const PD13_INVALID_STRUCTURE_CATEGORIES = Object.freeze([
    "Undefined recognized element",
    "Empty Sequence",
    "Empty Parallel",
    "Invalid Branch",
    "Invalid Merge",
    "Infinite recursion",
    "Incomplete structure (PD-3–PD-7 violation)",
] as const);
