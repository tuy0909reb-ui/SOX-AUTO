/**
 * ASA Minimum Runtime — ConfirmService
 * Human Confirmation gate BEFORE RecordCommitAPI.
 * Confirm is never inside CommitAPI.
 */

import { RecordCommitAPI, type RecordCommitResult } from "../commit";
import {
    isDecisionOrArchitectureType,
    requiresHumanConfirmation,
    type RecordDraft,
} from "./Draft";
import { DraftStore } from "./DraftStore";

export interface ConfirmOverrides {
    readonly type?: string;
    readonly title?: string;
    readonly content?: string;
    readonly evidence?: readonly string[];
    readonly tags?: readonly string[];
    readonly relatedRecords?: readonly string[];
    readonly source?: string;
}

export interface ConfirmAndCommitResult {
    readonly draft: RecordDraft;
    readonly commit: RecordCommitResult;
}

export interface ConfirmServiceOptions {
    readonly draftStore: DraftStore;
    readonly commitApi: RecordCommitAPI;
    readonly now?: () => Date;
}

export class ConfirmRequiredError extends Error {
    readonly code = "CONFIRM_REQUIRED" as const;
    constructor(message: string) {
        super(message);
        this.name = "ConfirmRequiredError";
    }
}

export class ConfirmService {
    private readonly draftStore: DraftStore;
    private readonly commitApi: RecordCommitAPI;
    private readonly now: () => Date;

    constructor(options: ConfirmServiceOptions) {
        this.draftStore = options.draftStore;
        this.commitApi = options.commitApi;
        this.now = options.now ?? (() => new Date());
    }

    /**
     * Human Confirmation + Official Commit via RecordCommitAPI only.
     * Decision / Architecture（and Narrow: all types）require this path.
     */
    confirmAndCommit(
        draftId: string,
        overrides: ConfirmOverrides = {}
    ): ConfirmAndCommitResult {
        const draft = this.draftStore.load(draftId);
        if (draft.status === "committed") {
            throw new Error(
                `draft already committed: ${draftId} → ${draft.committedRecordId}`
            );
        }
        if (draft.status === "rejected") {
            throw new Error(`draft was rejected: ${draftId}`);
        }
        if (draft.status !== "open") {
            throw new Error(`draft not open: ${draftId}（status=${draft.status}）`);
        }

        const type = (overrides.type ?? draft.type).trim();
        // Calling this method IS Human Confirmation. Decision/Architecture always covered.
        if (
            !requiresHumanConfirmation(type) &&
            isDecisionOrArchitectureType(type)
        ) {
            throw new ConfirmRequiredError(
                `Human Confirmation required before Official Commit for type: ${type}`
            );
        }

        const title = (overrides.title ?? draft.title).trim();
        const content = overrides.content ?? draft.content;
        const evidence = [
            ...(overrides.evidence ?? draft.evidenceProposal),
        ];
        const tags = [...(overrides.tags ?? draft.metadataProposal.tags)];
        const relatedRecords = [
            ...(overrides.relatedRecords ??
                draft.metadataProposal.relatedRecords),
        ];
        const source =
            overrides.source ?? draft.metadataProposal.source ?? "";

        if (!type || !title) {
            throw new Error("confirmed draft must have type and title");
        }

        const commit = this.commitApi.commit({
            type,
            title,
            content,
            evidence,
            metadata: { tags, relatedRecords, source },
        });

        const committedAt = this.now().toISOString();
        const updated = {
            ...draft,
            type,
            title,
            content,
            evidenceProposal: evidence,
            metadataProposal: {
                tags,
                relatedRecords,
                source,
            },
            status: "committed" as const,
            committedRecordId: commit.record.id,
            committedAt,
            updatedAt: committedAt,
        };
        this.draftStore.save(updated);

        return Object.freeze({
            draft: this.draftStore.load(draftId),
            commit,
        });
    }

    reject(draftId: string, reason?: string): RecordDraft {
        const draft = this.draftStore.load(draftId);
        if (draft.status === "committed") {
            throw new Error(`cannot reject committed draft: ${draftId}`);
        }
        const updatedAt = this.now().toISOString();
        this.draftStore.save({
            ...draft,
            status: "rejected",
            rejectReason: reason ?? "rejected by human",
            updatedAt,
        });
        return this.draftStore.load(draftId);
    }
}
