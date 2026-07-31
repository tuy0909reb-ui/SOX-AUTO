/**
 * ASA-ARCH-44.0 — ArchitectureRegistry
 * Immutable Architecture Lifecycle Ledger.
 * Append-only. Structural integrity only. No decisions / approvals / meaning evaluation.
 */

import { freezeLifecycleTransitionRecord } from "../events/LifecycleTransitionRecord";
import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { DeclarationIdentity } from "../identity/DeclarationIdentity";
import { createRecordIdentity } from "../identity/RecordIdentity";
import type { ImmutableRegistryAppendRequest } from "../lifecycle/LifecycleOperation";
import { ArchitectureLifecycleState } from "../lifecycle/LifecycleState";
import { freezeRegistryHistory, type RegistryHistory } from "./RegistryHistory";
import {
    freezeRegistryRecord,
    type RegistryRecord,
} from "./RegistryRecord";
import type { RegistryRepositoryContract } from "./RegistryRepositoryContract";

export class InMemoryRegistryRepository implements RegistryRepositoryContract {
    readonly appendOnly = true as const;
    private readonly current = new Map<string, RegistryRecord>();
    private readonly historyMap = new Map<
        string,
        ReturnType<typeof freezeLifecycleTransitionRecord>[]
    >();

    getCurrent(architecture: ArchitectureIdentity): RegistryRecord | undefined {
        return this.current.get(architecture);
    }

    getHistory(architecture: ArchitectureIdentity) {
        return Object.freeze([...(this.historyMap.get(architecture) ?? [])]);
    }

    /** Initial declaration only — no transition semantics. */
    bootstrap(record: RegistryRecord): void {
        if (this.current.has(record.architecture)) {
            throw new Error("Architecture already registered");
        }
        this.current.set(record.architecture, record);
        this.historyMap.set(record.architecture, []);
    }

    append(
        next: RegistryRecord,
        transition: ReturnType<typeof freezeLifecycleTransitionRecord>
    ): void {
        const key = next.architecture;
        const existing = this.current.get(key);
        if (!existing) {
            throw new Error("Architecture not registered");
        }
        if (existing.recordId === next.recordId) {
            throw new Error("Registry overwrite forbidden");
        }
        this.current.set(key, next);
        const hist = this.historyMap.get(key) ?? [];
        hist.push(transition);
        this.historyMap.set(key, hist);
    }
}

export class ArchitectureRegistry {
    constructor(private readonly repository: RegistryRepositoryContract) {}

    /** Bootstrap registration without a lifecycle transition. */
    bootstrap(input: {
        declarationId: DeclarationIdentity;
        architecture: ArchitectureIdentity;
        version: string;
    }): RegistryRecord {
        const record = freezeRegistryRecord({
            recordId: createRecordIdentity(`rec-${input.architecture}-0`),
            declarationId: input.declarationId,
            architecture: input.architecture,
            status: ArchitectureLifecycleState.REGISTERED,
            version: input.version,
            lastTransitionId: null,
            integrityReference: null,
        });
        if (!(this.repository instanceof InMemoryRegistryRepository)) {
            throw new Error("bootstrap requires InMemoryRegistryRepository");
        }
        this.repository.bootstrap(record);
        return record;
    }

    append(request: ImmutableRegistryAppendRequest): RegistryRecord {
        if (!request.containsNoRawValidatorResults) {
            throw new Error("Append request must exclude raw validator results");
        }
        if (!request.containsNoDecisionData) {
            throw new Error("Append request must exclude decision data");
        }
        if (
            !request.transitionEvaluationEvidenceReference ||
            !request.authorityVerificationEvidenceReference
        ) {
            throw new Error(
                "Incomplete append request — evidence references required"
            );
        }

        const current = this.repository.getCurrent(request.architecture);
        if (!current) {
            throw new Error("Architecture not registered");
        }
        if (current.status !== request.from) {
            throw new Error(
                `Current status ${current.status} does not match transition from ${request.from}`
            );
        }
        if (current.status === ArchitectureLifecycleState.SUPERSEDED) {
            throw new Error("SUPERSEDED is permanently immutable");
        }

        const transitionRecord = freezeLifecycleTransitionRecord({
            recordId: createRecordIdentity(
                `tr-${request.transitionId}-${request.to}`
            ),
            transitionId: request.transitionId,
            architecture: request.architecture,
            from: request.from,
            to: request.to,
            transitionEvaluationEvidenceReference:
                request.transitionEvaluationEvidenceReference,
            authorityVerificationEvidenceReference:
                request.authorityVerificationEvidenceReference,
            validationReference: request.validationReference,
            approvalReference: request.approvalReference,
            timestamp: new Date().toISOString(),
        });

        const next = freezeRegistryRecord({
            recordId: createRecordIdentity(
                `rec-${request.architecture}-${request.transitionId}`
            ),
            declarationId: current.declarationId,
            architecture: request.architecture,
            status: request.to,
            version: current.version,
            lastTransitionId: request.transitionId,
            integrityReference: current.integrityReference,
        });

        this.repository.append(next, transitionRecord);
        return next;
    }

    lookup(architecture: ArchitectureIdentity): RegistryRecord | undefined {
        return this.repository.getCurrent(architecture);
    }

    history(architecture: ArchitectureIdentity): RegistryHistory {
        return freezeRegistryHistory(
            architecture,
            this.repository.getHistory(architecture)
        );
    }
}

export const ARCHITECTURE_REGISTRY_CAPABILITIES = Object.freeze({
    immutableLedger: true,
    appendOnly: true,
    canDecideTransitions: false,
    canAuthorizeChanges: false,
    canValidateArchitectureCorrectness: false,
    canCreateApprovals: false,
    canGenerateDecisions: false,
    canCreateTransitions: false,
    evaluatesReferenceMeaning: false,
});
