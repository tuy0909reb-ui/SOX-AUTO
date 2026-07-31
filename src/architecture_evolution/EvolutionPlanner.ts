/**
 * ASA-ARCH-42.0 - Evolution Planner Module (Draft 0.6)
 *
 * Generates EvolutionProposal from Architecture Intent.
 * Does not approve, freeze, or implement.
 */

import {
    freezeEvolutionProposal,
    type EvolutionProposal,
} from "./EvolutionProposal";
import type { EvolutionRiskLevel } from "./ArchitectureEvolutionTypes";

export interface ArchitectureIntent {
    readonly intentId: string;
    readonly description: string;
    readonly target_area: string;
    readonly motivation: string;
    readonly proposed_state: string;
    readonly risk_level?: EvolutionRiskLevel;
}

export interface CurrentArchitectureState {
    readonly architecture_version: string;
    readonly current_state: string;
    readonly known_contracts: ReadonlyArray<string>;
}

export interface EvolutionPlannerInput {
    readonly intent: ArchitectureIntent;
    readonly currentState: CurrentArchitectureState;
    readonly architectureVersion: string;
    readonly created_at: string;
    readonly created_by: string;
    readonly proposalId: string;
    readonly proposalVersion: string;
}

export interface EvolutionPlannerRole {
    readonly roleId: "EVOLUTION_PLANNER";
    readonly generatesProposal: true;
    readonly forbidsApprove: true;
    readonly forbidsFreeze: true;
    readonly forbidsImplement: true;
}

export function freezeEvolutionPlannerRole(): EvolutionPlannerRole {
    return Object.freeze({
        roleId: "EVOLUTION_PLANNER" as const,
        generatesProposal: true as const,
        forbidsApprove: true as const,
        forbidsFreeze: true as const,
        forbidsImplement: true as const,
    });
}

export function createEvolutionProposal(
    input: EvolutionPlannerInput
): EvolutionProposal {
    return freezeEvolutionProposal({
        id: input.proposalId,
        version: input.proposalVersion,
        architecture_version: input.architectureVersion,
        created_at: input.created_at,
        created_by: input.created_by,
        target_area: input.intent.target_area,
        motivation: input.intent.motivation,
        current_state: input.currentState.current_state,
        proposed_state: input.intent.proposed_state,
        affected_contracts: [...input.currentState.known_contracts],
        dependency_changes: Object.freeze([] as string[]),
        compatibility_check: "PENDING",
        risk_level: input.intent.risk_level ?? "MEDIUM",
        rollback_strategy: "RESTORE_PRIOR_SNAPSHOT",
        approval_state: "DRAFT",
    });
}
