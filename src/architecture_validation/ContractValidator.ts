/**
 * ASA-ARCH-43.0 - Contract Validator (Draft 0.7)
 */

import { hashArtifact } from "./HashIntegrity";
import {
    freezeContractValidationResult,
    type ContractValidationResult,
} from "./ValidationResultContracts";

export interface FrozenContractSnapshot {
    readonly contractId: string;
    readonly payload: Readonly<Record<string, unknown>>;
    readonly hash: string;
}

export interface RegisteredArchitectureSnapshot {
    readonly snapshotId: string;
    readonly contracts: Readonly<Record<string, unknown>>;
    readonly hash: string;
}

export interface ContractValidatorRole {
    readonly roleId: "CONTRACT_VALIDATOR";
    readonly forbidsModifyContract: true;
}

export function freezeContractValidatorRole(): ContractValidatorRole {
    return Object.freeze({
        roleId: "CONTRACT_VALIDATOR" as const,
        forbidsModifyContract: true as const,
    });
}

export function createFrozenContractSnapshot(input: {
    readonly contractId: string;
    readonly payload: Record<string, unknown>;
}): FrozenContractSnapshot {
    const payload = Object.freeze({ ...input.payload });
    return Object.freeze({
        contractId: input.contractId,
        payload,
        hash: hashArtifact(payload),
    });
}

export function validateContract(input: {
    readonly id: string;
    readonly frozen: FrozenContractSnapshot;
    readonly registered: RegisteredArchitectureSnapshot;
    readonly evidence_reference: string;
}): ContractValidationResult {
    const registeredPayload = input.registered.contracts[input.frozen.contractId];
    const violations: string[] = [];
    if (registeredPayload === undefined) {
        violations.push(`Missing registered contract: ${input.frozen.contractId}`);
    } else if (
        hashArtifact(registeredPayload) !== input.frozen.hash &&
        JSON.stringify(registeredPayload) !== JSON.stringify(input.frozen.payload)
    ) {
        violations.push(
            `Modified contract detected: ${input.frozen.contractId}`
        );
    }
    return freezeContractValidationResult({
        id: input.id,
        validator: "CONTRACT_VALIDATOR",
        target: input.frozen.contractId,
        rule_reference: "RULE-101",
        status: violations.length === 0 ? "PASS" : "FAIL",
        violations,
        evidence_reference: input.evidence_reference,
    });
}
