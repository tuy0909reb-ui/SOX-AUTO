/**
 * ASA Minimum Runtime — DraftStore
 * Mutable drafts under <rootDir>/drafts/ — never Official Storage/History.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
    freezeDraft,
    type DraftStatus,
    type RecordDraft,
    type RecordDraftCreateInput,
} from "./Draft";

export interface DraftStoreOptions {
    readonly rootDir: string;
    readonly randomId?: () => string;
    readonly now?: () => Date;
}

export class DraftStore {
    readonly rootDir: string;
    readonly draftsDir: string;
    private readonly randomId: () => string;
    private readonly now: () => Date;

    constructor(options: DraftStoreOptions) {
        this.rootDir = path.resolve(options.rootDir);
        this.draftsDir = path.join(this.rootDir, "drafts");
        this.randomId = options.randomId ?? (() => crypto.randomUUID());
        this.now = options.now ?? (() => new Date());
    }

    ensureLayout(): void {
        fs.mkdirSync(this.draftsDir, { recursive: true });
    }

    draftPath(draftId: string): string {
        const safe = draftId.trim();
        if (!safe || safe.includes("/") || safe.includes("\\") || safe.includes("..")) {
            throw new Error("draft id contains illegal path characters");
        }
        return path.join(this.draftsDir, `${safe}.json`);
    }

    exists(draftId: string): boolean {
        return fs.existsSync(this.draftPath(draftId));
    }

    create(input: Omit<RecordDraftCreateInput, "draftId" | "createdAt"> & {
        draftId?: string;
    }): RecordDraft {
        this.ensureLayout();
        const createdAt = this.now().toISOString();
        const draftId = (input.draftId ?? this.randomId()).trim();
        if (this.exists(draftId)) {
            throw new Error(`draft already exists: ${draftId}`);
        }
        const draft = freezeDraft({
            draftId,
            status: "open",
            intake: input.intake,
            type: input.type.trim(),
            title: input.title.trim(),
            content: input.content ?? "",
            evidenceProposal: [...(input.evidenceProposal ?? [])],
            metadataProposal: {
                tags: [...(input.metadataProposal?.tags ?? [])],
                relatedRecords: [
                    ...(input.metadataProposal?.relatedRecords ?? []),
                ],
                source: (input.metadataProposal?.source ?? "").trim(),
            },
            sourceDocuments: [...(input.sourceDocuments ?? [])],
            fingerprint: input.fingerprint,
            createdAt,
            updatedAt: createdAt,
        });
        this.write(draft);
        return draft;
    }

    load(draftId: string): RecordDraft {
        const filePath = this.draftPath(draftId);
        if (!fs.existsSync(filePath)) {
            throw new Error(`draft not found: ${draftId}`);
        }
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as RecordDraft;
        return freezeDraft({
            ...parsed,
            evidenceProposal: [...(parsed.evidenceProposal ?? [])],
            metadataProposal: {
                tags: [...(parsed.metadataProposal?.tags ?? [])],
                relatedRecords: [
                    ...(parsed.metadataProposal?.relatedRecords ?? []),
                ],
                source: parsed.metadataProposal?.source ?? "",
            },
            sourceDocuments: [...(parsed.sourceDocuments ?? [])],
        });
    }

    save(draft: RecordDraft): void {
        this.write(freezeDraft({ ...draft, updatedAt: this.now().toISOString() }));
    }

    list(status?: DraftStatus): RecordDraft[] {
        this.ensureLayout();
        const ids = fs
            .readdirSync(this.draftsDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => f.replace(/\.json$/, ""))
            .sort();
        const drafts = ids.map((id) => this.load(id));
        return status ? drafts.filter((d) => d.status === status) : drafts;
    }

    findOpenByFingerprint(fingerprint: string): RecordDraft | undefined {
        return this.list("open").find((d) => d.fingerprint === fingerprint);
    }

    /** Drafts live outside records/ — never Official. */
    isUnderOfficialRecords(draftId: string): boolean {
        const p = this.draftPath(draftId);
        return p.includes(`${path.sep}records${path.sep}`);
    }

    private write(draft: RecordDraft): void {
        this.ensureLayout();
        const filePath = this.draftPath(draft.draftId);
        fs.writeFileSync(filePath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
    }
}
