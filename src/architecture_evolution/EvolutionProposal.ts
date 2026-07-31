/**
 * ASA-ARCH-42.0 - EvolutionProposal Contract (Draft 0.6)
 *
 * Declarative proposal schema. Proposal ≠ Approval / Freeze / Implementation.
 */

import type {
    EvolutionRiskLevel,
    ProposalApprovalState,
} from "./ArchitectureEvolutionTypes";

export type EvolutionProposalField =
    | "id"
    | "version"
    | "architecture_version"
    | "created_at"
    | "created_by"
    | "target_area"
    | "motivation"
    | "current_state"
    | "proposed_state"
    | "affected_contracts"
    | "dependency_changes"
    | "compatibility_check"
    | "risk_level"
    | "rollback_strategy"
    | "approval_state";

export const EVOLUTION_PROPOSAL_REQUIRED_FIELDS: ReadonlyArray<EvolutionProposalField> =
    Object.freeze([
        "id",
        "version",
        "architecture_version",
        "created_at",
        "created_by",
        "target_area",
        "motivation",
        "current_state",
        "proposed_state",
        "affected_contracts",
        "dependency_changes",
        "compatibility_check",
        "risk_level",
        "rollback_strategy",
        "approval_state",
    ]);

export interface EvolutionProposal {
    readonly id: string;
    readonly version: string;
    readonly architecture_version: string;
    readonly created_at: string;
    readonly created_by: string;
    readonly target_area: string;
    readonly motivation: string;
    readonly current_state: string;
    readonly proposed_state: string;
    readonly affected_contracts: ReadonlyArray<string>;
    readonly dependency_changes: ReadonlyArray<string>;
    readonly compatibility_check: string;
    readonly risk_level: EvolutionRiskLevel;
    readonly rollback_strategy: string;
    readonly approval_state: ProposalApprovalState;
    readonly proposalIsNotApproval: true;
    readonly proposalIsNotFreezeAuthorization: true;
    readonly proposalIsNotImplementation: true;
}

export interface EvolutionProposalSchemaContract {
    readonly schemaId: "asa.evolution.proposal.v1";
    readonly requiredFields: ReadonlyArray<EvolutionProposalField>;
    readonly proposalIsNotApproval: true;
    readonly proposalIsNotFreezeAuthorization: true;
}

export function freezeEvolutionProposalSchema(): EvolutionProposalSchemaContract {
    return Object.freeze({
        schemaId: "asa.evolution.proposal.v1" as const,
        requiredFields: EVOLUTION_PROPOSAL_REQUIRED_FIELDS,
        proposalIsNotApproval: true as const,
        proposalIsNotFreezeAuthorization: true as const,
    });
}

export function freezeEvolutionProposal(
    input: Omit<
        EvolutionProposal,
        | "proposalIsNotApproval"
        | "proposalIsNotFreezeAuthorization"
        | "proposalIsNotImplementation"
    >
): EvolutionProposal {
    return Object.freeze({
        ...input,
        affected_contracts: Object.freeze([...input.affected_contracts]),
        dependency_changes: Object.freeze([...input.dependency_changes]),
        proposalIsNotApproval: true as const,
        proposalIsNotFreezeAuthorization: true as const,
        proposalIsNotImplementation: true as const,
    });
}

export function validateEvolutionProposalSchema(
    value: unknown
): { readonly ok: true } | { readonly ok: false; readonly reason: string } {
    if (value === null || typeof value !== "object") {
        return { ok: false, reason: "EvolutionProposal must be an object" };
    }
    const obj = value as Record<string, unknown>;
    for (const field of EVOLUTION_PROPOSAL_REQUIRED_FIELDS) {
        if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
            return { ok: false, reason: `Missing required field: ${field}` };
        }
    }
    if (!Array.isArray(obj.affected_contracts)) {
        return { ok: false, reason: "affected_contracts must be an array" };
    }
    if (!Array.isArray(obj.dependency_changes)) {
        return { ok: false, reason: "dependency_changes must be an array" };
    }
    const risks = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (typeof obj.risk_level !== "string" || !risks.includes(obj.risk_level)) {
        return { ok: false, reason: "Invalid risk_level" };
    }
    return { ok: true };
}
