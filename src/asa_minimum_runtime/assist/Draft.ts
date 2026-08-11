/**
 * ASA Minimum Runtime — Assisted Loop Narrow: Draft model
 * Draft ≠ Official Record. Non-hashed. Outside Storage/History.
 */

export type DraftStatus = "open" | "rejected" | "committed";

export type DraftIntake = "design-registration-assist";

export interface DraftMetadataProposal {
    readonly tags: readonly string[];
    readonly relatedRecords: readonly string[];
    readonly source: string;
}

export interface RecordDraft {
    readonly draftId: string;
    readonly status: DraftStatus;
    readonly intake: DraftIntake;
    readonly type: string;
    readonly title: string;
    readonly content: string;
    readonly evidenceProposal: readonly string[];
    readonly metadataProposal: DraftMetadataProposal;
    /** Source document paths（repo-relative preferred）. */
    readonly sourceDocuments: readonly string[];
    /** Soft dedup key（source+type+title）. Not used to auto-delete. */
    readonly fingerprint: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly committedRecordId?: string;
    readonly committedAt?: string;
    readonly rejectReason?: string;
}

export interface RecordDraftCreateInput {
    readonly draftId: string;
    readonly intake: DraftIntake;
    readonly type: string;
    readonly title: string;
    readonly content: string;
    readonly evidenceProposal?: readonly string[];
    readonly metadataProposal?: Partial<DraftMetadataProposal>;
    readonly sourceDocuments?: readonly string[];
    readonly fingerprint: string;
    readonly createdAt: string;
}

export function freezeDraft(input: RecordDraft): RecordDraft {
    return Object.freeze({
        draftId: input.draftId,
        status: input.status,
        intake: input.intake,
        type: input.type,
        title: input.title,
        content: input.content,
        evidenceProposal: Object.freeze([...input.evidenceProposal]),
        metadataProposal: Object.freeze({
            tags: Object.freeze([...input.metadataProposal.tags]),
            relatedRecords: Object.freeze([
                ...input.metadataProposal.relatedRecords,
            ]),
            source: input.metadataProposal.source,
        }),
        sourceDocuments: Object.freeze([...input.sourceDocuments]),
        fingerprint: input.fingerprint,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
        committedRecordId: input.committedRecordId,
        committedAt: input.committedAt,
        rejectReason: input.rejectReason,
    });
}

/** Narrow policy: every Official Commit via Assist requires Human Confirmation. */
export const NARROW_REQUIRE_CONFIRM_ALL_TYPES = true;

export function requiresHumanConfirmation(type: string): boolean {
    if (NARROW_REQUIRE_CONFIRM_ALL_TYPES) {
        return true;
    }
    const t = type.trim().toLowerCase();
    return t.includes("decision") || t.includes("architecture");
}

export function isDecisionOrArchitectureType(type: string): boolean {
    const t = type.trim().toLowerCase();
    return t.includes("decision") || t.includes("architecture");
}
