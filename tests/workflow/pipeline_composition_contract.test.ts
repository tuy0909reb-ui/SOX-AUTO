import * as fs from "fs";
import * as path from "path";
import {
    PIPELINE_COMPOSITION_CONTRACTS,
    PIPELINE_COMPOSITION_CONTRACT_IDS,
    PIPELINE_COMPOSITION_CONTRACT_OUTCOME,
    PIPELINE_COMPOSITION_CONTRACT_VERIFICATION,
    PipelineCompositionContractId,
    getPipelineCompositionContract,
} from "../../src/workflow/PipelineCompositionContract";
import { COMPOSITION_BOUNDARY_CONTRACT_IDS } from "../../src/workflow/CompositionBoundaryContract";
import { COMPOSITION_INTEGRATION_IDS } from "../../src/workflow/CompositionIntegration";
import { COMPOSITION_EVOLUTION_IDS } from "../../src/workflow/CompositionEvolution";
import { COMPOSITION_LIFECYCLE_IDS } from "../../src/workflow/CompositionLifecycle";
import { COMPOSITION_VALIDATION_IDS } from "../../src/workflow/CompositionValidation";
import { COMPOSITION_CONSTRAINT_IDS } from "../../src/workflow/CompositionConstraints";
import { COMPOSITION_INVARIANT_IDS } from "../../src/workflow/CompositionInvariants";
import { COMPOSITION_CONTRACT_IDS } from "../../src/workflow/CompositionContract";
import { COMPOSITION_MODEL_IDS } from "../../src/workflow/CompositionModel";
import { COMPOSITION_BOUNDARY_IDS } from "../../src/workflow/CompositionBoundary";
import { COMPOSITION_PRINCIPLE_IDS } from "../../src/workflow/CompositionPrinciples";

const SRC = path.resolve(
    __dirname,
    "../../src/workflow/PipelineCompositionContract.ts"
);
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_pipeline_composition_contract.md"
);

const EXPECTED: Array<{
    id: PipelineCompositionContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "PCC-1",
        title: "Pipeline Composition Scope",
        statement:
            "Pipeline composition contract SHALL define structural composition relationships between Pipeline structures and referenced Composition structures. Pipeline composition scope SHALL remain declarative.",
    },
    {
        id: "PCC-2",
        title: "Composition Reference Integrity",
        statement:
            "Pipeline composition contract SHALL preserve references between Pipeline structures and integrated Composition structures. Reference integrity SHALL remain structural only.",
    },
    {
        id: "PCC-3",
        title: "Pipeline Structure Identity",
        statement:
            "Every Pipeline composition structure SHALL preserve structural identity. Pipeline structure identity SHALL remain structurally identifiable.",
    },
    {
        id: "PCC-4",
        title: "Structural Assembly Contract",
        statement:
            "Pipeline composition SHALL preserve structural consistency during Pipeline composition assembly. Structural assembly SHALL remain independent of runtime semantics.",
    },
    {
        id: "PCC-5",
        title: "Responsibility Boundary",
        statement:
            "Pipeline composition contract SHALL preserve responsibility boundaries between Pipeline structures and Composition structures. Responsibilities SHALL remain explicitly isolated.",
    },
    {
        id: "PCC-6",
        title: "Contract Determinism",
        statement:
            "Equivalent Pipeline composition structures SHALL preserve identical structural composition semantics. Pipeline composition semantics SHALL remain deterministic.",
    },
    {
        id: "PCC-7",
        title: "Compatibility Preservation",
        statement:
            "Pipeline composition contract SHALL preserve compatibility with existing and frozen architectural contracts. Pipeline composition SHALL NOT invalidate existing and frozen structural contracts.",
    },
    {
        id: "PCC-8",
        title: "Downstream Execution Boundary",
        statement:
            "Pipeline composition contract SHALL preserve structural boundaries with downstream execution contracts. Execution contracts SHALL NOT redefine Pipeline composition responsibilities. Execution contracts SHALL consume Pipeline composition contracts only.",
    },
    {
        id: "PCC-9",
        title: "Evolution Compatibility",
        statement:
            "Pipeline composition contract SHALL preserve compatibility with structural evolution contracts. Evolution SHALL NOT bypass frozen Pipeline composition contracts.",
    },
    {
        id: "PCC-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of Pipeline composition contracts. Pipeline composition contracts SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 12 — Pipeline Composition Contract", () => {
    test("PCC-1 through PCC-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(PIPELINE_COMPOSITION_CONTRACT_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(PIPELINE_COMPOSITION_CONTRACTS).toHaveLength(10);
        for (const e of EXPECTED) {
            const c = getPipelineCompositionContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("Pipeline Composition Verification and Outcome are preserved", () => {
        expect([...PIPELINE_COMPOSITION_CONTRACT_VERIFICATION]).toEqual([
            "Runtime execution",
            "Runtime composition binding",
            "Execution lifecycle management",
            "Composition execution algorithms",
            "Expansion algorithms",
            "Validation algorithms",
            "Failure handling",
            "ExecutionGraph construction",
            "Scheduling",
            "Optimization",
            "Performance characteristics",
            "Engine allocation",
            "Dispatch behavior",
        ]);
        expect(Object.isFrozen(PIPELINE_COMPOSITION_CONTRACT_VERIFICATION)).toBe(
            true
        );
        expect(PIPELINE_COMPOSITION_CONTRACT_OUTCOME.statement).toMatch(
            /architectural structural foundation for subsequent Pipeline execution/
        );
        expect(PIPELINE_COMPOSITION_CONTRACT_OUTCOME.scope).toMatch(
            /Pipeline structural composition contracts only/
        );
        expect(PIPELINE_COMPOSITION_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(PIPELINE_COMPOSITION_CONTRACT_OUTCOME)).toBe(
            true
        );
    });

    test("registry is immutable; declarative-only; no runtime binding / ExecutionGraph", () => {
        expect(Object.isFrozen(PIPELINE_COMPOSITION_CONTRACTS)).toBe(true);
        expect(Object.isFrozen(PIPELINE_COMPOSITION_CONTRACT_IDS)).toBe(true);
        expect(() => {
            (PIPELINE_COMPOSITION_CONTRACTS as unknown as Array<unknown>).push(
                {}
            );
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural Pipeline composition contract registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindComposition|buildExecutionGraph)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExecutionGraphBuilder|CompositionBinder)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 1–11 contracts; Chapter 11 Boundary Contract unchanged", () => {
        expect(COMPOSITION_PRINCIPLE_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_IDS).toHaveLength(10);
        expect(COMPOSITION_MODEL_IDS).toHaveLength(10);
        expect(COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(COMPOSITION_INVARIANT_IDS).toHaveLength(10);
        expect(COMPOSITION_CONSTRAINT_IDS).toHaveLength(10);
        expect(COMPOSITION_VALIDATION_IDS).toHaveLength(10);
        expect(COMPOSITION_LIFECYCLE_IDS).toHaveLength(10);
        expect(COMPOSITION_EVOLUTION_IDS).toHaveLength(10);
        expect(COMPOSITION_INTEGRATION_IDS).toHaveLength(10);
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_COMPOSITION_CONTRACT_IDS[0]).toBe("PCC-1");
        expect(PIPELINE_COMPOSITION_CONTRACT_IDS[9]).toBe("PCC-10");
        expect(getPipelineCompositionContract("PCC-8").statement).toMatch(
            /consume Pipeline composition contracts only/
        );
    });
});
