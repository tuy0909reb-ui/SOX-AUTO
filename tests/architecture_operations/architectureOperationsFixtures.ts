import { createArchitectureIdentity } from "../../src/architecture_operations/identity/ArchitectureIdentity";
import { createDeclarationIdentity } from "../../src/architecture_operations/identity/DeclarationIdentity";
import { createTransitionIdentity } from "../../src/architecture_operations/identity/TransitionIdentity";
import { ArchitectureLifecycleState } from "../../src/architecture_operations/lifecycle/LifecycleState";
import { freezeLifecycleTransition } from "../../src/architecture_operations/lifecycle/LifecycleTransition";
import { createApprovalReference } from "../../src/architecture_operations/references/ApprovalReference";
import { createValidationReference } from "../../src/architecture_operations/references/ValidationReference";
import type { OperationsAuthorityRole } from "../../src/architecture_operations/contracts/AuthorityContract";

export const ARCH = createArchitectureIdentity("ASA-ARCH-44.0");
export const DECL = createDeclarationIdentity("decl-asa-arch-44-0");

export function transition(input: {
    id: string;
    from: ArchitectureLifecycleState;
    to: ArchitectureLifecycleState;
    requestedBy: OperationsAuthorityRole;
    freezeVerificationFail?: boolean;
    frozenIssued?: boolean;
}) {
    return freezeLifecycleTransition({
        transitionId: createTransitionIdentity(input.id),
        architecture: ARCH,
        from: input.from,
        to: input.to,
        requestedBy: input.requestedBy,
        freezeVerificationFail: input.freezeVerificationFail,
        frozenIssued: input.frozenIssued,
    });
}

export function validationRef(id = "ch43-ev-001") {
    return createValidationReference("ValidationEvidenceReference", id);
}

export function freezeApproval(id = "ha-freeze-001") {
    return createApprovalReference("FreezeAuthorizationReference", id);
}

export function supersedeApproval(id = "ha-supersede-001") {
    return createApprovalReference("SupersessionApprovalReference", id);
}

export function decisionApproval(id = "ha-decision-001") {
    return createApprovalReference("DecisionApprovalReference", id);
}
