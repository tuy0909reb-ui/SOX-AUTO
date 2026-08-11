/**
 * ASA Minimum Runtime — Design Registration Assist
 * Intake: docs/baselines/ASA-* and docs/reports/ASA-REGISTER-*
 * Produces Drafts only — never Official Commit.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import type { RecordDraft } from "./Draft";
import { DraftStore } from "./DraftStore";

export interface DesignRegistrationAssistOptions {
    readonly draftStore: DraftStore;
    /** Repository root for resolving relative doc paths. Default: process.cwd() */
    readonly repoRoot?: string;
    readonly now?: () => Date;
    readonly randomId?: () => string;
}

export interface DesignRegistrationInput {
    /** Path to ASA-REGISTER-* report（required）. */
    readonly registerPath: string;
    /** Optional baseline ASA-* path（auto-detected from register when omitted）. */
    readonly baselinePath?: string;
}

export interface DesignRegistrationResult {
    readonly drafts: readonly RecordDraft[];
    readonly reused: readonly string[];
    readonly warnings: readonly string[];
}

function toPosixRel(repoRoot: string, abs: string): string {
    const rel = path.relative(repoRoot, abs);
    return rel.split(path.sep).join("/");
}

function isAllowedSource(relPosix: string): boolean {
    const normalized = relPosix.replace(/\\/g, "/");
    const base = path.posix.basename(normalized);
    if (
        normalized.includes("docs/baselines/") &&
        base.startsWith("ASA-") &&
        base.endsWith(".md")
    ) {
        return true;
    }
    if (
        normalized.includes("docs/reports/") &&
        base.startsWith("ASA-REGISTER-") &&
        base.endsWith(".md")
    ) {
        return true;
    }
    return false;
}

function extractField(md: string, label: string): string | undefined {
    const re = new RegExp(
        `\\*\\*${label}:\\*\\*\\s*(.+)$`,
        "im"
    );
    const m = md.match(re);
    return m?.[1]?.trim().replace(/\*\*/g, "");
}

function extractTitle(md: string): string {
    const fromField = extractField(md, "Title");
    if (fromField) return fromField;
    const h1 = md.match(/^#\s+(.+)$/m);
    return (h1?.[1] ?? "Untitled registration").trim();
}

function extractTargetId(md: string, registerRel: string): string {
    const target = extractField(md, "Target");
    if (target) return target.trim();
    const recordId = extractField(md, "Record ID");
    if (recordId && recordId.startsWith("ASA-")) return recordId.trim();
    const base = path.posix.basename(registerRel);
    return base
        .replace(/^ASA-REGISTER-/, "ASA-")
        .replace(/\.md$/i, "");
}

function extractEvidencePaths(md: string): string[] {
    const found = new Set<string>();
    const tick = /`([^`]+)`/g;
    let m: RegExpExecArray | null;
    while ((m = tick.exec(md)) !== null) {
        const p = m[1]!.trim();
        if (
            p.startsWith("docs/") ||
            p.startsWith("data/") ||
            p.includes("/reports/") ||
            p.endsWith(".md") ||
            p.endsWith(".csv") ||
            p.endsWith(".json")
        ) {
            if (!p.includes("\n") && p.length < 260) found.add(p);
        }
    }
    return [...found];
}

function extractRelatedNames(md: string): string[] {
    const names: string[] = [];
    const lines = md.split(/\r?\n/);
    let inRelated = false;
    for (const line of lines) {
        if (/Previous Related Records/i.test(line)) {
            inRelated = true;
            continue;
        }
        if (inRelated) {
            if (line.startsWith("**") && !line.trim().startsWith("-")) {
                break;
            }
            if (line.startsWith("---")) break;
            const item = line.match(/^\s*-\s+(ASA-[A-Z0-9._-]+)/i);
            if (item) names.push(item[1]!);
        }
    }
    // Connection table rows
    for (const line of lines) {
        const row = line.match(/^\|\s*(ASA-[A-Z0-9._-]+)\s*\|/i);
        if (row) names.push(row[1]!);
    }
    return [...new Set(names)];
}

function guessBaselineFromRegister(
    repoRoot: string,
    registerRel: string,
    md: string
): string | undefined {
    const artifact = md.match(
        /Artifact:\s*`?(docs\/baselines\/ASA-[^`\s]+\.md)`?/i
    );
    if (artifact) {
        const abs = path.resolve(repoRoot, artifact[1]!);
        if (fs.existsSync(abs)) return artifact[1]!;
    }
    const target = extractTargetId(md, registerRel);
    const candidate = `docs/baselines/${target}.md`;
    if (fs.existsSync(path.resolve(repoRoot, candidate))) return candidate;
    return undefined;
}

function fingerprint(parts: {
    registerRel: string;
    type: string;
    title: string;
}): string {
    const raw = `${parts.registerRel}|${parts.type}|${parts.title}`;
    return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export class DesignRegistrationAssist {
    private readonly draftStore: DraftStore;
    private readonly repoRoot: string;
    private readonly now: () => Date;
    private readonly randomId: () => string;

    constructor(options: DesignRegistrationAssistOptions) {
        this.draftStore = options.draftStore;
        this.repoRoot = path.resolve(options.repoRoot ?? process.cwd());
        this.now = options.now ?? (() => new Date());
        this.randomId = options.randomId ?? (() => crypto.randomUUID());
    }

    /**
     * Create Decision + Verification drafts from registration documents.
     * Never writes Official Storage/History.
     */
    createDrafts(input: DesignRegistrationInput): DesignRegistrationResult {
        const registerAbs = path.resolve(this.repoRoot, input.registerPath);
        if (!fs.existsSync(registerAbs)) {
            throw new Error(`register document not found: ${input.registerPath}`);
        }
        const registerRel = toPosixRel(this.repoRoot, registerAbs);
        if (!isAllowedSource(registerRel)) {
            throw new Error(
                `intake limited to docs/baselines/ASA-* or docs/reports/ASA-REGISTER-*（got ${registerRel}）`
            );
        }
        if (!path.posix.basename(registerRel).startsWith("ASA-REGISTER-")) {
            throw new Error(
                `design-registration requires ASA-REGISTER-* report（got ${registerRel}）`
            );
        }

        const registerMd = fs.readFileSync(registerAbs, "utf8");
        const warnings: string[] = [];
        const reused: string[] = [];

        let baselineRel =
            input.baselinePath !== undefined
                ? toPosixRel(
                      this.repoRoot,
                      path.resolve(this.repoRoot, input.baselinePath)
                  )
                : guessBaselineFromRegister(
                      this.repoRoot,
                      registerRel,
                      registerMd
                  );

        if (baselineRel) {
            const baselineAbs = path.resolve(this.repoRoot, baselineRel);
            if (!fs.existsSync(baselineAbs)) {
                throw new Error(`baseline document not found: ${baselineRel}`);
            }
            baselineRel = toPosixRel(this.repoRoot, baselineAbs);
            if (!isAllowedSource(baselineRel)) {
                throw new Error(
                    `baseline path not allowed for Narrow intake: ${baselineRel}`
                );
            }
        } else {
            warnings.push(
                "baseline path not found; Decision draft will use register document only"
            );
        }

        const title = extractTitle(registerMd);
        const targetId = extractTargetId(registerMd, registerRel);
        const status = extractField(registerMd, "Status") ?? "";
        const evidence = extractEvidencePaths(registerMd);
        if (baselineRel && !evidence.includes(baselineRel)) {
            evidence.unshift(baselineRel);
        }
        if (!evidence.includes(registerRel)) {
            evidence.unshift(registerRel);
        }

        const relatedNames = extractRelatedNames(registerMd);
        const sourceDocs = [registerRel, ...(baselineRel ? [baselineRel] : [])];
        const tags = [
            "design-registration",
            "assisted-loop-narrow",
            targetId,
        ];

        const decisionTitle = `${targetId} Design Validated Registration`;
        const verificationTitle = `Verify ${targetId} Registration Constraints`;

        const decisionContent = [
            `Design Registration Assist draft（not Official until Human Confirmation）.`,
            ``,
            `Target: ${targetId}`,
            `Title: ${title}`,
            `Status: ${status || "(see source document)"}`,
            ``,
            `Source register: ${registerRel}`,
            baselineRel ? `Source baseline: ${baselineRel}` : "",
            ``,
            `This draft does not authorize trading, capital transfer, or Architecture mutation.`,
            `Human must Confirm before RecordCommitAPI.`,
        ]
            .filter(Boolean)
            .join("\n");

        const verificationContent = [
            `Verification draft for Design Registration constraints.`,
            ``,
            `Target: ${targetId}`,
            `Method: Review registration constraints and evidence references in source documents.`,
            `Criteria: Registration constraints hold; evidence paths referenced; no trading authorization implied.`,
            `Result: PENDING Human Confirmation（Assist does not assert PASS/FAIL）.`,
            ``,
            `Source register: ${registerRel}`,
            baselineRel ? `Source baseline: ${baselineRel}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        const drafts: RecordDraft[] = [];

        const decisionFp = fingerprint({
            registerRel,
            type: "Decision Record",
            title: decisionTitle,
        });
        const existingDecision =
            this.draftStore.findOpenByFingerprint(decisionFp);
        if (existingDecision) {
            warnings.push(
                `open Decision draft already exists for fingerprint（reusing ${existingDecision.draftId}; not auto-deleted）`
            );
            reused.push(existingDecision.draftId);
            drafts.push(existingDecision);
        } else {
            drafts.push(
                this.draftStore.create({
                    draftId: this.randomId(),
                    intake: "design-registration-assist",
                    type: "Decision Record",
                    title: decisionTitle,
                    content: decisionContent,
                    evidenceProposal: evidence,
                    metadataProposal: {
                        tags,
                        relatedRecords: relatedNames,
                        source: registerRel,
                    },
                    sourceDocuments: sourceDocs,
                    fingerprint: decisionFp,
                })
            );
        }

        const verificationFp = fingerprint({
            registerRel,
            type: "Verification Record",
            title: verificationTitle,
        });
        const existingVerification =
            this.draftStore.findOpenByFingerprint(verificationFp);
        if (existingVerification) {
            warnings.push(
                `open Verification draft already exists for fingerprint（reusing ${existingVerification.draftId}; not auto-deleted）`
            );
            reused.push(existingVerification.draftId);
            drafts.push(existingVerification);
        } else {
            drafts.push(
                this.draftStore.create({
                    draftId: this.randomId(),
                    intake: "design-registration-assist",
                    type: "Verification Record",
                    title: verificationTitle,
                    content: verificationContent,
                    evidenceProposal: evidence,
                    metadataProposal: {
                        tags: [...tags, "verification"],
                        relatedRecords: relatedNames,
                        source: registerRel,
                    },
                    sourceDocuments: sourceDocs,
                    fingerprint: verificationFp,
                })
            );
        }

        void this.now;
        return Object.freeze({
            drafts: Object.freeze([...drafts]),
            reused: Object.freeze([...reused]),
            warnings: Object.freeze([...warnings]),
        });
    }
}
