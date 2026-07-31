import * as fs from "fs";
import * as path from "path";
import {
    COMPOSITION_BOUNDARY_CONTRACTS,
    COMPOSITION_BOUNDARY_CONTRACT_IDS,
    COMPOSITION_BOUNDARY_CONTRACT_OUTCOME,
    COMPOSITION_BOUNDARY_CONTRACT_VERIFICATION,
    CompositionBoundaryContractId,
    getCompositionBoundaryContract,
} from "../../src/workflow/CompositionBoundaryContract";
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
    "../../src/workflow/CompositionBoundaryContract.ts"
);
const SPEC = path.resolve(
    __dirname,
    "../../docs/specs/asa_arch_21_3_composition_boundary_contract.md"
);

const EXPECTED: Array<{
    id: CompositionBoundaryContractId;
    title: string;
    statement: string;
}> = [
    {
        id: "CBC-1",
        title: "Boundary Scope",
        statement:
            "Composition boundary SHALL define structural boundaries between integrated Composition structures and subsequent Pipeline contracts. Boundary scope SHALL remain declarative.",
    },
    {
        id: "CBC-2",
        title: "Ownership Boundary",
        statement:
            "Composition boundary SHALL preserve structural ownership of composition entities. Ownership SHALL remain independent of runtime semantics.",
    },
    {
        id: "CBC-3",
        title: "Responsibility Separation",
        statement:
            "Composition boundary SHALL preserve separation of structural responsibilities between Composition structures and downstream Pipeline contracts. Responsibilities SHALL remain explicitly isolated.",
    },
    {
        id: "CBC-4",
        title: "Contract Exposure",
        statement:
            "Composition boundary SHALL define structural contract exposure to downstream architectural contracts. Structural exposure SHALL remain declarative. Exposed contracts SHALL remain declarative.",
    },
    {
        id: "CBC-5",
        title: "Structural Isolation",
        statement:
            "Composition boundary SHALL preserve structural isolation between Composition structures and downstream contracts. Internal composition structures SHALL NOT alter external boundary semantics.",
    },
    {
        id: "CBC-6",
        title: "Boundary Determinism",
        statement:
            "Equivalent structural composition boundaries SHALL preserve identical boundary semantics. Boundary semantics SHALL remain deterministic.",
    },
    {
        id: "CBC-7",
        title: "Compatibility Preservation",
        statement:
            "Composition boundary SHALL preserve compatibility with existing and frozen architectural contracts. Boundary definition SHALL NOT invalidate existing and frozen composition contracts.",
    },
    {
        id: "CBC-8",
        title: "Downstream Boundary",
        statement:
            "Composition boundary SHALL preserve structural separation from downstream Pipeline contracts. Downstream contracts SHALL NOT redefine composition responsibilities.",
    },
    {
        id: "CBC-9",
        title: "Evolution Boundary",
        statement:
            "Composition boundary SHALL preserve compatibility with structural evolution contracts. Evolution SHALL NOT bypass frozen boundary contracts.",
    },
    {
        id: "CBC-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition boundary contracts. Composition boundary contracts SHALL remain purely declarative.",
    },
];

describe("ASA-ARCH-21.3 Chapter 11 — Composition Boundary Contract", () => {
    test("CBC-1 through CBC-10 are completely registered", () => {
        expect(fs.existsSync(SRC)).toBe(true);
        expect(fs.existsSync(SPEC)).toBe(true);
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS).toEqual(
            EXPECTED.map((e) => e.id)
        );
        expect(COMPOSITION_BOUNDARY_CONTRACTS).toHaveLength(10);
        for (const e of EXPECTED) {
            const c = getCompositionBoundaryContract(e.id);
            expect(c.title).toBe(e.title);
            expect(c.statement).toBe(e.statement);
            expect(Object.isFrozen(c)).toBe(true);
        }
    });

    test("CBC coverage: scope, ownership, separation, exposure, isolation, determinism", () => {
        expect(getCompositionBoundaryContract("CBC-1").title).toBe(
            "Boundary Scope"
        );
        expect(getCompositionBoundaryContract("CBC-2").statement).toMatch(
            /structural ownership/
        );
        expect(getCompositionBoundaryContract("CBC-3").statement).toMatch(
            /explicitly isolated/
        );
        expect(getCompositionBoundaryContract("CBC-4").statement).toMatch(
            /Exposed contracts SHALL remain declarative/
        );
        expect(getCompositionBoundaryContract("CBC-5").statement).toMatch(
            /SHALL NOT alter external boundary semantics/
        );
        expect(getCompositionBoundaryContract("CBC-6").statement).toMatch(
            /remain deterministic/
        );
    });

    test("CBC-7–CBC-10: frozen compatibility, downstream, evolution, behavioral exclusion", () => {
        expect(getCompositionBoundaryContract("CBC-7").statement).toMatch(
            /SHALL NOT invalidate existing and frozen composition contracts/
        );
        expect(getCompositionBoundaryContract("CBC-8").statement).toMatch(
            /SHALL NOT redefine composition responsibilities/
        );
        expect(getCompositionBoundaryContract("CBC-9").statement).toMatch(
            /SHALL NOT bypass frozen boundary contracts/
        );
        expect(getCompositionBoundaryContract("CBC-10").statement).toMatch(
            /purely declarative/
        );
    });

    test("Boundary Verification and Boundary Outcome are preserved", () => {
        expect([...COMPOSITION_BOUNDARY_CONTRACT_VERIFICATION]).toEqual([
            "Runtime execution",
            "Runtime ownership transfer",
            "Boundary enforcement algorithms",
            "Dynamic boundary modification",
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
        expect(Object.isFrozen(COMPOSITION_BOUNDARY_CONTRACT_VERIFICATION)).toBe(
            true
        );
        expect(COMPOSITION_BOUNDARY_CONTRACT_OUTCOME.statement).toMatch(
            /architectural boundary foundation between integrated Composition structures/
        );
        expect(COMPOSITION_BOUNDARY_CONTRACT_OUTCOME.scope).toMatch(
            /structural boundary semantics only/
        );
        expect(COMPOSITION_BOUNDARY_CONTRACT_OUTCOME.exclusion).toMatch(
            /Behavioral semantics are intentionally excluded/
        );
        expect(Object.isFrozen(COMPOSITION_BOUNDARY_CONTRACT_OUTCOME)).toBe(
            true
        );
    });

    test("registry is immutable; declarative-only; no enforcement / runtime dependency", () => {
        expect(Object.isFrozen(COMPOSITION_BOUNDARY_CONTRACTS)).toBe(true);
        expect(Object.isFrozen(COMPOSITION_BOUNDARY_CONTRACT_IDS)).toBe(true);
        expect(() => {
            (COMPOSITION_BOUNDARY_CONTRACTS as unknown as Array<unknown>).push(
                {}
            );
        }).toThrow();

        const body = fs.readFileSync(SRC, "utf8");
        expect(body).toMatch(
            /Declarative structural composition boundary contract registry only/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|optimize|assignEngine|dispatch|enforceBoundary|transferOwnership|modifyBoundary)\b/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|BoundaryEnforcer|OwnershipTransfer|BoundaryMutator)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("preserves frozen Chapter 1–10 contracts (extension only)", () => {
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
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS[0]).toBe("CBC-1");
        expect(COMPOSITION_BOUNDARY_CONTRACT_IDS[9]).toBe("CBC-10");
    });
});
