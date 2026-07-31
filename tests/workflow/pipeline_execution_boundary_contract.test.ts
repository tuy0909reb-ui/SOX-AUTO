import * as fs from "fs";
import * as path from "path";
import {
    PIPELINE_EXECUTION_BOUNDARY_CONTRACTS,
    PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS,
    PIPELINE_EXECUTION_BOUNDARY_CONTRACT_OUTCOME,
    PIPELINE_EXECUTION_BOUNDARY_CONTRACT_VERIFICATION,
    PipelineExecutionBoundaryContractId,
    getPipelineExecutionBoundaryContract,
} from "../../src/workflow/PipelineExecutionBoundaryContract";
import { PIPELINE_COMPOSITION_CONTRACT_IDS } from "../../src/workflow/PipelineCompositionContract";
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
    "../../src/workflow/PipelineExecutionBoundaryContract.ts"
);
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_pipeline_execution_boundary_contract.md"
);

const EXPECTED: Array<{
    id: PipelineExecutionBoundaryContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "PEB-1",
        title: "Execution Boundary Scope",
        statement:
            "Pipeline execution boundary SHALL define structural boundaries between Pipeline Composition contracts and Execution contracts. Execution boundary scope SHALL remain declarative.",
    },
    {
        id: "PEB-2",
        title: "Composition Ownership Preservation",
        statement:
            "Pipeline execution boundary SHALL preserve ownership of Pipeline Composition structures. Execution contracts SHALL consume composition contracts only. Ownership SHALL remain independent of runtime semantics.",
    },
    {
        id: "PEB-3",
        title: "Responsibility Separation",
        statement:
            "Pipeline execution boundary SHALL preserve separation between composition responsibilities and execution responsibilities. Responsibilities SHALL remain explicitly isolated.",
    },
    {
        id: "PEB-4",
        title: "Execution Contract Exposure",
        statement:
            "Pipeline execution boundary SHALL define structural exposure of Pipeline Composition contracts to Execution contracts. Exposed Pipeline Composition information SHALL remain structural and declarative.",
    },
    {
        id: "PEB-5",
        title: "Structural Isolation",
        statement:
            "Pipeline execution boundary SHALL preserve structural isolation between Pipeline Composition structures and Execution structures. Internal execution structures SHALL NOT alter composition boundary semantics.",
    },
    {
        id: "PEB-6",
        title: "Boundary Determinism",
        statement:
            "Equivalent Pipeline execution boundaries SHALL preserve identical structural boundary semantics. Boundary semantics SHALL remain deterministic.",
    },
    {
        id: "PEB-7",
        title: "Frozen Contract Preservation",
        statement:
            "Pipeline execution boundary SHALL preserve compatibility with frozen Pipeline Composition contracts. Execution boundaries SHALL NOT invalidate frozen structural contracts.",
    },
    {
        id: "PEB-8",
        title: "Execution Responsibility Boundary",
        statement:
            "Execution contracts SHALL NOT redefine Pipeline Composition responsibilities. Pipeline Composition responsibilities SHALL remain limited to structural composition semantics.",
    },
    {
        id: "PEB-9",
        title: "Downstream Runtime Boundary",
        statement:
            "Pipeline execution boundary SHALL preserve separation from downstream Runtime contracts. Runtime contracts SHALL consume Execution contracts through defined execution boundaries only.",
    },
    {
        id: "PEB-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of Pipeline execution boundary contracts. Pipeline execution boundary contracts SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 13 — Pipeline Execution Boundary Contract", () => {
    test("PEB-1 through PEB-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACTS).toHaveLength(10);
        for (const e of EXPECTED) {
            const c = getPipelineExecutionBoundaryContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("Boundary Verification and Outcome are preserved", () => {
        expect([...PIPELINE_EXECUTION_BOUNDARY_CONTRACT_VERIFICATION]).toEqual([
            "Runtime execution",
            "Execution state management",
            "Execution lifecycle management",
            "Runtime binding",
            "ExecutionGraph construction",
            "Scheduling algorithms",
            "Dispatch algorithms",
            "Engine allocation",
            "Optimization algorithms",
            "Resource management",
            "Failure handling",
            "Performance characteristics",
        ]);
        expect(
            Object.isFrozen(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_VERIFICATION)
        ).toBe(true);
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_OUTCOME.statement).toMatch(
            /boundary foundation between Pipeline Composition contracts and subsequent Execution/
        );
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_OUTCOME.scope).toMatch(
            /structural execution boundary semantics only/
        );
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(
            Object.isFrozen(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_OUTCOME)
        ).toBe(true);
    });

    test("registry is immutable; declarative-only; no runtime / ExecutionGraph / scheduling", () => {
        expect(Object.isFrozen(PIPELINE_EXECUTION_BOUNDARY_CONTRACTS)).toBe(
            true
        );
        expect(Object.isFrozen(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS)).toBe(
            true
        );
        expect(() => {
            (
                PIPELINE_EXECUTION_BOUNDARY_CONTRACTS as unknown as Array<unknown>
            ).push({});
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural Pipeline execution boundary contract registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|bindRuntime|buildExecutionGraph|manageState)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 1–12 contracts; Ch11/Ch12 unchanged", () => {
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
        expect(PIPELINE_COMPOSITION_CONTRACT_IDS).toHaveLength(10);
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS[0]).toBe("PEB-1");
        expect(PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS[9]).toBe("PEB-10");
        expect(getPipelineExecutionBoundaryContract("PEB-2").statement).toMatch(
            /consume composition contracts only/
        );
        expect(getPipelineExecutionBoundaryContract("PEB-9").statement).toMatch(
            /through defined execution boundaries only/
        );
    });
});
