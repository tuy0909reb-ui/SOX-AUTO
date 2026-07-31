import {
    ARCHITECTURE_OPERATIONS_LAYER,
} from "../../src/architecture_operations";
import {
    freezeArchitectureLifecycleContract,
} from "../../src/architecture_operations/contracts/ArchitectureLifecycleContract";
import {
    freezeAuthorityContract,
} from "../../src/architecture_operations/contracts/AuthorityContract";
import {
    AUTHORITY_BOUNDARY_VALIDATOR_CAPABILITIES,
    validateAuthorityBoundary,
} from "../../src/architecture_operations/compliance/AuthorityBoundaryValidator";
import { checkOperationalCompliance } from "../../src/architecture_operations/compliance/OperationalComplianceCheck";
import {
    buildRegistryAppendRequest,
    LIFECYCLE_OPERATION_CAPABILITIES,
} from "../../src/architecture_operations/lifecycle/LifecycleOperation";
import { freezeLifecyclePolicy } from "../../src/architecture_operations/lifecycle/LifecyclePolicy";
import { ArchitectureLifecycleState } from "../../src/architecture_operations/lifecycle/LifecycleState";
import {
    LIFECYCLE_TRANSITION_VALIDATOR_CAPABILITIES,
    validateLifecycleTransition,
} from "../../src/architecture_operations/lifecycle/LifecycleTransitionValidator";
import {
    ARCHITECTURE_REGISTRY_CAPABILITIES,
    ArchitectureRegistry,
    InMemoryRegistryRepository,
} from "../../src/architecture_operations/registry/ArchitectureRegistry";
import {
    ARCH,
    DECL,
    decisionApproval,
    freezeApproval,
    supersedeApproval,
    transition,
    validationRef,
} from "./architectureOperationsFixtures";

function applyValidated(
    registry: ArchitectureRegistry,
    t: ReturnType<typeof transition>,
    approval: ReturnType<typeof freezeApproval> | null = null
) {
    const tv = validateLifecycleTransition(t);
    const av = validateAuthorityBoundary({
        transition: t,
        approvalReference: approval,
    });
    expect(tv.status).toBe("PASS");
    expect(av.status).toBe("PASS");
    const req = buildRegistryAppendRequest({
        transition: t,
        transitionEvaluationEvidenceReference: `tev-${t.transitionId}`,
        authorityVerificationEvidenceReference: `aev-${t.transitionId}`,
        validationReference: validationRef(),
        approvalReference: approval,
        transitionValidation: tv,
        authorityValidation: av,
    });
    return registry.append(req);
}

describe("ASA-ARCH-44.0 — Lifecycle", () => {
    test("valid transition accepted", () => {
        const t = transition({
            id: "t1",
            from: ArchitectureLifecycleState.REGISTERED,
            to: ArchitectureLifecycleState.DESIGNING,
            requestedBy: "OPERATIONS_COORDINATOR",
        });
        expect(validateLifecycleTransition(t).status).toBe("PASS");
    });

    test("invalid transition rejected", () => {
        const t = transition({
            id: "t-bad",
            from: ArchitectureLifecycleState.REGISTERED,
            to: ArchitectureLifecycleState.FROZEN,
            requestedBy: "HUMAN_ARCHITECT",
        });
        const r = validateLifecycleTransition(t);
        expect(r.status).toBe("FAIL");
        expect(r.reasons.length).toBeGreaterThan(0);
    });

    test("frozen protection verification", () => {
        const t = transition({
            id: "t-frozen-bad",
            from: ArchitectureLifecycleState.FROZEN,
            to: ArchitectureLifecycleState.DESIGNING,
            requestedBy: "HUMAN_ARCHITECT",
        });
        expect(validateLifecycleTransition(t).status).toBe("FAIL");
    });

    test("superseded protection verification", () => {
        const t = transition({
            id: "t-superseded",
            from: ArchitectureLifecycleState.SUPERSEDED,
            to: ArchitectureLifecycleState.REGISTERED,
            requestedBy: "HUMAN_ARCHITECT",
        });
        expect(validateLifecycleTransition(t).status).toBe("FAIL");
    });

    test("automatic freeze prevention verification", () => {
        expect(ARCHITECTURE_OPERATIONS_LAYER.hasAutomaticFreeze).toBe(false);
        expect(
            LIFECYCLE_TRANSITION_VALIDATOR_CAPABILITIES.canExecuteTransition
        ).toBe(false);
    });

    test("validator/operation separation verification", () => {
        expect(
            LIFECYCLE_TRANSITION_VALIDATOR_CAPABILITIES.canInitiateRegistryOperations
        ).toBe(false);
        expect(LIFECYCLE_OPERATION_CAPABILITIES.canBypassValidator).toBe(false);
    });

    test("structural validator isolation verification", () => {
        expect(
            LIFECYCLE_TRANSITION_VALIDATOR_CAPABILITIES.structuralValidationOnly
        ).toBe(true);
        expect(
            LIFECYCLE_TRANSITION_VALIDATOR_CAPABILITIES.canGenerateDecision
        ).toBe(false);
    });

    test("FREEZE_CANDIDATE → DESIGNING conditional", () => {
        const fail = transition({
            id: "t-reopen-fail",
            from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
            to: ArchitectureLifecycleState.DESIGNING,
            requestedBy: "HUMAN_ARCHITECT",
        });
        expect(validateLifecycleTransition(fail).status).toBe("FAIL");

        const ok = transition({
            id: "t-reopen-ok",
            from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
            to: ArchitectureLifecycleState.DESIGNING,
            requestedBy: "HUMAN_ARCHITECT",
            freezeVerificationFail: true,
            frozenIssued: false,
        });
        expect(validateLifecycleTransition(ok).status).toBe("PASS");
    });
});

describe("ASA-ARCH-44.0 — Authority", () => {
    test("AI rejection", () => {
        const t = transition({
            id: "t-ai",
            from: ArchitectureLifecycleState.REGISTERED,
            to: ArchitectureLifecycleState.DESIGNING,
            requestedBy: "AI_AGENT",
        });
        const r = validateAuthorityBoundary({
            transition: t,
            approvalReference: null,
        });
        expect(r.status).toBe("FAIL");
    });

    test("Coordinator rejection for freeze", () => {
        const t = transition({
            id: "t-coord-freeze",
            from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
            to: ArchitectureLifecycleState.FROZEN,
            requestedBy: "OPERATIONS_COORDINATOR",
        });
        const r = validateAuthorityBoundary({
            transition: t,
            approvalReference: freezeApproval(),
        });
        expect(r.status).toBe("FAIL");
    });

    test("Human approval acceptance", () => {
        const t = transition({
            id: "t-human-freeze",
            from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
            to: ArchitectureLifecycleState.FROZEN,
            requestedBy: "HUMAN_ARCHITECT",
        });
        const r = validateAuthorityBoundary({
            transition: t,
            approvalReference: freezeApproval(),
        });
        expect(r.status).toBe("PASS");
    });

    test("missing approval rejection", () => {
        const t = transition({
            id: "t-missing-appr",
            from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
            to: ArchitectureLifecycleState.FROZEN,
            requestedBy: "HUMAN_ARCHITECT",
        });
        expect(
            validateAuthorityBoundary({
                transition: t,
                approvalReference: null,
            }).status
        ).toBe("FAIL");
    });

    test("invalid approver rejection", () => {
        expect(AUTHORITY_BOUNDARY_VALIDATOR_CAPABILITIES.canCreateApproval).toBe(
            false
        );
        const t = transition({
            id: "t-wrong-kind",
            from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
            to: ArchitectureLifecycleState.FROZEN,
            requestedBy: "HUMAN_ARCHITECT",
        });
        expect(
            validateAuthorityBoundary({
                transition: t,
                approvalReference: decisionApproval(),
            }).status
        ).toBe("FAIL");
    });
});

describe("ASA-ARCH-44.0 — Registry", () => {
    test("append-only and immutable lookup", () => {
        const registry = new ArchitectureRegistry(new InMemoryRegistryRepository());
        registry.bootstrap({
            declarationId: DECL,
            architecture: ARCH,
            version: "0.18",
        });
        const after = applyValidated(
            registry,
            transition({
                id: "t-reg-1",
                from: ArchitectureLifecycleState.REGISTERED,
                to: ArchitectureLifecycleState.DESIGNING,
                requestedBy: "OPERATIONS_COORDINATOR",
            })
        );
        expect(after.status).toBe(ArchitectureLifecycleState.DESIGNING);
        expect(registry.lookup(ARCH)?.status).toBe(
            ArchitectureLifecycleState.DESIGNING
        );
        expect(registry.history(ARCH).appendOnly).toBe(true);
        expect(registry.history(ARCH).records.length).toBe(1);
    });

    test("registry authority isolation", () => {
        expect(ARCHITECTURE_REGISTRY_CAPABILITIES.canDecideTransitions).toBe(
            false
        );
        expect(ARCHITECTURE_REGISTRY_CAPABILITIES.canCreateApprovals).toBe(
            false
        );
        expect(ARCHITECTURE_REGISTRY_CAPABILITIES.canCreateTransitions).toBe(
            false
        );
        expect(ARCHITECTURE_REGISTRY_CAPABILITIES.canGenerateDecisions).toBe(
            false
        );
    });

    test("frozen → superseded with approval", () => {
        const registry = new ArchitectureRegistry(new InMemoryRegistryRepository());
        registry.bootstrap({
            declarationId: DECL,
            architecture: ARCH,
            version: "0.18",
        });
        applyValidated(
            registry,
            transition({
                id: "a",
                from: ArchitectureLifecycleState.REGISTERED,
                to: ArchitectureLifecycleState.DESIGNING,
                requestedBy: "OPERATIONS_COORDINATOR",
            })
        );
        applyValidated(
            registry,
            transition({
                id: "b",
                from: ArchitectureLifecycleState.DESIGNING,
                to: ArchitectureLifecycleState.IMPLEMENTED,
                requestedBy: "OPERATIONS_COORDINATOR",
            })
        );
        applyValidated(
            registry,
            transition({
                id: "c",
                from: ArchitectureLifecycleState.IMPLEMENTED,
                to: ArchitectureLifecycleState.VERIFIED,
                requestedBy: "OPERATIONS_COORDINATOR",
            })
        );
        applyValidated(
            registry,
            transition({
                id: "d",
                from: ArchitectureLifecycleState.VERIFIED,
                to: ArchitectureLifecycleState.FREEZE_CANDIDATE,
                requestedBy: "OPERATIONS_COORDINATOR",
            })
        );
        applyValidated(
            registry,
            transition({
                id: "e",
                from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
                to: ArchitectureLifecycleState.FROZEN,
                requestedBy: "HUMAN_ARCHITECT",
            }),
            freezeApproval()
        );
        const final = applyValidated(
            registry,
            transition({
                id: "f",
                from: ArchitectureLifecycleState.FROZEN,
                to: ArchitectureLifecycleState.SUPERSEDED,
                requestedBy: "HUMAN_ARCHITECT",
            }),
            supersedeApproval()
        );
        expect(final.status).toBe(ArchitectureLifecycleState.SUPERSEDED);
    });
});

describe("ASA-ARCH-44.0 — Identity / Reference / Boundary", () => {
    test("identity uniqueness verification", () => {
        expect(ARCH).toBe("ASA-ARCH-44.0");
        expect(DECL).toBe("decl-asa-arch-44-0");
    });

    test("immutable reference verification", () => {
        const v = validationRef();
        expect(v.readOnly).toBe(true);
        expect(v.sourceChapter).toBe("ASA-ARCH-43.0");
        const a = freezeApproval();
        expect(a.sourceAuthority).toBe("HUMAN_ARCHITECT");
    });

    test("operational compliance check", () => {
        const r = checkOperationalCompliance({
            contractsPresent: true,
            dependencyDeclarationConsistent: true,
            validationReference: validationRef(),
            approvalReference: freezeApproval(),
            requireValidationReference: true,
            requireApprovalReference: true,
        });
        expect(r.status).toBe("PASS");
        expect(r.doesNotEvaluateComplianceQuality).toBe(true);
    });

    test("Ch42/Ch43/Core/Runtime/Decision isolation", () => {
        expect(ARCHITECTURE_OPERATIONS_LAYER.preservesCh42).toBe(true);
        expect(ARCHITECTURE_OPERATIONS_LAYER.preservesCh43).toBe(true);
        expect(ARCHITECTURE_OPERATIONS_LAYER.preservesCh35).toBe(true);
        expect(ARCHITECTURE_OPERATIONS_LAYER.hasRuntimeIntegration).toBe(false);
        expect(ARCHITECTURE_OPERATIONS_LAYER.hasValidationExecution).toBe(
            false
        );
        expect(ARCHITECTURE_OPERATIONS_LAYER.hasEvolutionAnalysis).toBe(false);
        expect(ARCHITECTURE_OPERATIONS_LAYER.hasDecisionGenerationApi).toBe(
            false
        );
        expect(LIFECYCLE_OPERATION_CAPABILITIES.canInvokeCh42).toBe(false);
        expect(LIFECYCLE_OPERATION_CAPABILITIES.canInvokeCh43).toBe(false);
        expect(LIFECYCLE_OPERATION_CAPABILITIES.canGenerateDecisions).toBe(
            false
        );
    });

    test("LifecycleOperation cannot bypass Validator", () => {
        const t = transition({
            id: "t-bypass",
            from: ArchitectureLifecycleState.REGISTERED,
            to: ArchitectureLifecycleState.FROZEN,
            requestedBy: "HUMAN_ARCHITECT",
        });
        const tv = validateLifecycleTransition(t);
        expect(tv.status).toBe("FAIL");
        const av = validateAuthorityBoundary({
            transition: t,
            approvalReference: freezeApproval(),
        });
        expect(() =>
            buildRegistryAppendRequest({
                transition: t,
                transitionEvaluationEvidenceReference: "x",
                authorityVerificationEvidenceReference: "y",
                validationReference: null,
                approvalReference: freezeApproval(),
                transitionValidation: tv,
                authorityValidation: av,
            })
        ).toThrow(/PASS TransitionValidationResult/);
    });

    test("contracts freeze", () => {
        const life = freezeArchitectureLifecycleContract();
        expect(life.allowedTransitions.length).toBe(7);
        const auth = freezeAuthorityContract();
        expect(auth.finalAuthority).toBe("HUMAN_ARCHITECT");
        const policy = freezeLifecyclePolicy(life);
        expect(policy.doesNotMutateState).toBe(true);
    });
});
