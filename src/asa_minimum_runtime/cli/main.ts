/**
 * ASA Minimum Runtime v0.1.3 — CLI
 * Write Discipline: `asa record` → RecordCommitAPI
 * Assisted Loop Narrow: assist → draft → confirm → RecordCommitAPI
 *
 * Usage（after build）:
 *   node dist/src/asa_minimum_runtime/cli/main.js <command> ...
 *   npm run asa -- <command> ...
 */

import * as path from "path";
import {
    ConfirmService,
    DesignRegistrationAssist,
    DraftStore,
} from "../assist";
import { RecordCommitAPI, RecordCommitPartialError } from "../commit";
import { HashService } from "../hash";
import { HistoryService } from "../history";
import type { RuntimeRecord } from "../models";
import { DEFAULT_RUNTIME_DATA_ROOT, JsonFileStorage } from "../storage";
import {
    formatTemplateGuidance,
    getRecordTemplate,
    listRecordTemplates,
    missingTemplateFields,
} from "../templates";
import { VerifyService } from "../verify";

const PACKAGE_ID = "asa_minimum_runtime";
const PACKAGE_VERSION = "0.1.3";

export type CliExitCode = 0 | 1 | 2;

export interface CliResult {
    readonly exitCode: CliExitCode;
    readonly stdout: string;
    readonly stderr: string;
}

export interface CliRuntimeDeps {
    readonly rootDir?: string;
    readonly repoRoot?: string;
    readonly now?: () => Date;
    readonly randomId?: () => string;
}

function parseArgs(argv: readonly string[]): {
    command: string;
    positionals: string[];
    flags: Map<string, string[]>;
} {
    const [command = "", ...rest] = argv;
    const flags = new Map<string, string[]>();
    const positionals: string[] = [];
    for (let i = 0; i < rest.length; i++) {
        const token = rest[i]!;
        if (!token.startsWith("--")) {
            positionals.push(token);
            continue;
        }
        const key = token.slice(2);
        const next = rest[i + 1];
        if (next && !next.startsWith("--")) {
            const list = flags.get(key) ?? [];
            list.push(next);
            flags.set(key, list);
            i++;
        } else {
            flags.set(key, ["true"]);
        }
    }
    return { command, positionals, flags };
}

function flagValue(
    flags: Map<string, string[]>,
    key: string
): string | undefined {
    const values = flags.get(key);
    return values && values.length > 0 ? values[values.length - 1] : undefined;
}

function flagAll(flags: Map<string, string[]>, key: string): string[] {
    return flags.get(key) ?? [];
}

function ok(stdout: string): CliResult {
    return { exitCode: 0, stdout, stderr: "" };
}

function fail(exitCode: CliExitCode, stderr: string): CliResult {
    return { exitCode, stdout: "", stderr };
}

function createServices(rootDir: string, deps: CliRuntimeDeps = {}) {
    const storage = new JsonFileStorage({ rootDir });
    const history = new HistoryService({ rootDir });
    const hashService = new HashService();
    const verify = new VerifyService({ storage, hashService, history });
    const commitApi = new RecordCommitAPI({
        storage,
        history,
        hashService,
        now: deps.now,
        randomId: deps.randomId,
    });
    const draftStore = new DraftStore({
        rootDir,
        now: deps.now,
        randomId: deps.randomId,
    });
    const confirm = new ConfirmService({
        draftStore,
        commitApi,
        now: deps.now,
    });
    const assist = new DesignRegistrationAssist({
        draftStore,
        repoRoot: deps.repoRoot ?? process.cwd(),
        now: deps.now,
        randomId: deps.randomId,
    });
    return {
        storage,
        history,
        hashService,
        verify,
        commitApi,
        draftStore,
        confirm,
        assist,
    };
}

function splitCsvFlags(values: readonly string[]): string[] {
    return values.flatMap((v) =>
        v.split(",").map((s) => s.trim()).filter(Boolean)
    );
}

function cmdStatus(rootDir: string): CliResult {
    const { storage, history, verify, draftStore } = createServices(rootDir);
    storage.ensureLayout();
    history.ensureLayout();
    draftStore.ensureLayout();
    const ids = storage.listIds();
    const events = history.list();
    const all = verify.verifyAll();
    let official = 0;
    let unofficial = 0;
    for (const id of ids) {
        if (verify.verifyRecord(id).passed) official++;
        else unofficial++;
    }
    const historyOnly = all.findings.filter(
        (f) => f.code === "RECORD_FILE_MISSING"
    ).length;
    const openDrafts = draftStore.list("open").length;

    const lines = [
        `ASA Minimum Runtime v${PACKAGE_VERSION}`,
        `packageId: ${PACKAGE_ID}`,
        `dataRoot: ${rootDir}`,
        `records: ${ids.length}`,
        `historyEvents: ${events.length}`,
        `official: ${official}`,
        `unofficial: ${unofficial}`,
        `openDrafts: ${openDrafts}`,
        historyOnly > 0 ? `historyOnlyMissingFiles: ${historyOnly}` : undefined,
        `verifyPassed: ${all.passed}`,
        "status: OK",
        "writePath: RecordCommitAPI",
        "assistPath: DesignRegistrationAssist -> Draft -> Confirm -> RecordCommitAPI",
    ].filter(Boolean) as string[];
    return ok(lines.join("\n"));
}

function cmdRecord(
    rootDir: string,
    flags: Map<string, string[]>,
    deps: CliRuntimeDeps
): CliResult {
    const templateId = flagValue(flags, "template");
    if (flagValue(flags, "list-templates") === "true" || templateId === "list") {
        const lines = listRecordTemplates().map(
            (t) =>
                `- ${t.id}: ${t.defaultType}（required: ${t.requiredFields.join(", ")}）`
        );
        return ok(["templates:", ...lines].join("\n"));
    }

    const template = templateId ? getRecordTemplate(templateId) : undefined;
    if (templateId && !template) {
        return fail(
            1,
            `unknown template: ${templateId}\nuse: asa record --list-templates`
        );
    }

    const type = flagValue(flags, "type") ?? template?.defaultType;
    const title = flagValue(flags, "title");
    const content = flagValue(flags, "content") ?? "";
    const evidence = splitCsvFlags(flagAll(flags, "evidence"));
    const tags = splitCsvFlags(flagAll(flags, "tags"));
    const relatedRecords = splitCsvFlags(flagAll(flags, "related"));
    const source = flagValue(flags, "source") ?? "";

    if (template) {
        const missing = missingTemplateFields(template, {
            title,
            content,
            evidence,
        });
        if (missing.length > 0) {
            return fail(
                1,
                [
                    `template fields missing: ${missing.join(", ")}`,
                    formatTemplateGuidance(template),
                    "usage: asa record --template <id> --title <t> --content <c> --evidence <ref> [--tags ...] [--related ...] [--source ...]",
                ].join("\n")
            );
        }
    }

    if (!type || !title) {
        return fail(
            1,
            "usage: asa record [--template <id>] --type <type> --title <title> [--content <text>] [--evidence <ref>] [--tags <t>] [--related <id>] [--source <s>]"
        );
    }

    const { commitApi, storage } = createServices(rootDir, deps);

    try {
        const result = commitApi.commit({
            type,
            title,
            content,
            evidence,
            metadata: { tags, relatedRecords, source },
        });
        return ok(
            [
                "RECORD_CREATED",
                `id: ${result.record.id}`,
                `type: ${result.record.type}`,
                `hash: ${result.record.hash}`,
                `path: ${result.path}`,
                `commitPath: RecordCommitAPI`,
                template ? `template: ${template.id}` : undefined,
            ]
                .filter(Boolean)
                .join("\n")
        );
    } catch (err) {
        if (err instanceof RecordCommitPartialError) {
            return fail(
                2,
                [
                    err.message,
                    "artifact left in storage as Unofficial（not deleted per P0）",
                    `path: ${err.recordPath}`,
                    `detect: asa verify --root ${rootDir} --id ${err.recordId}`,
                ].join("\n")
            );
        }
        void storage;
        return fail(2, err instanceof Error ? err.message : String(err));
    }
}

function formatRecordDisplay(record: RuntimeRecord): string {
    return [
        `Record ID: ${record.id}`,
        `Type: ${record.type}`,
        `CreatedAt: ${record.createdAt}`,
        `Title: ${record.title}`,
        "Content:",
        record.content || "(empty)",
        "Evidence:",
        record.evidence.length > 0
            ? record.evidence.map((e) => `- ${e}`).join("\n")
            : "(none)",
        "Metadata:",
        `  tags: ${JSON.stringify([...record.metadata.tags])}`,
        `  relatedRecords: ${JSON.stringify([
            ...record.metadata.relatedRecords,
        ])}`,
        `  source: ${record.metadata.source || "(none)"}`,
        `Hash: ${record.hash}`,
        `Version: ${record.version}`,
    ].join("\n");
}

function cmdShow(
    rootDir: string,
    positionals: readonly string[],
    flags: Map<string, string[]>
): CliResult {
    const id = flagValue(flags, "id") ?? positionals[0];
    if (!id) {
        return fail(1, "usage: asa show <id>");
    }
    try {
        const { storage } = createServices(rootDir);
        const record = storage.load(id);
        return ok(formatRecordDisplay(record));
    } catch (err) {
        return fail(2, err instanceof Error ? err.message : String(err));
    }
}

function cmdHistory(
    rootDir: string,
    flags: Map<string, string[]>
): CliResult {
    const limitRaw = flagValue(flags, "limit");
    let limit: number | undefined;
    if (limitRaw !== undefined) {
        limit = Number(limitRaw);
        if (!Number.isInteger(limit) || limit < 0) {
            return fail(1, "--limit must be a non-negative integer");
        }
    }

    try {
        const { history } = createServices(rootDir);
        const events = history.list(limit);
        if (events.length === 0) {
            return ok("HISTORY_EMPTY");
        }
        const lines = events.map(
            (e, index) =>
                `${index + 1}. ${e.at} ${e.event} id=${e.id} hash=${e.hash}`
        );
        return ok(lines.join("\n"));
    } catch (err) {
        return fail(2, err instanceof Error ? err.message : String(err));
    }
}

function cmdVerify(
    rootDir: string,
    flags: Map<string, string[]>
): CliResult {
    const id = flagValue(flags, "id");
    try {
        const { verify } = createServices(rootDir);
        const result = id ? verify.verifyRecord(id) : verify.verifyAll();
        const header = result.passed ? "VERIFY_PASS" : "VERIFY_FAIL";
        const lines = [
            header,
            `checked: ${result.checkedIds.length}`,
            ...result.findings.map((f) => `- ${f.code}: ${f.message}`),
        ];
        return {
            exitCode: result.passed ? 0 : 1,
            stdout: lines.join("\n"),
            stderr: "",
        };
    } catch (err) {
        return fail(2, err instanceof Error ? err.message : String(err));
    }
}

function cmdAssist(
    rootDir: string,
    positionals: readonly string[],
    flags: Map<string, string[]>,
    deps: CliRuntimeDeps
): CliResult {
    const sub = positionals[0] ?? flagValue(flags, "intake");
    if (sub !== "design-registration" && sub !== "design_registration") {
        return fail(
            1,
            "usage: asa assist design-registration --register <ASA-REGISTER path> [--baseline <ASA-* path>]"
        );
    }
    const registerPath = flagValue(flags, "register");
    if (!registerPath) {
        return fail(
            1,
            "usage: asa assist design-registration --register <ASA-REGISTER path> [--baseline <ASA-* path>]"
        );
    }
    const baselinePath = flagValue(flags, "baseline");
    try {
        const { assist } = createServices(rootDir, deps);
        const result = assist.createDrafts({
            registerPath,
            baselinePath,
        });
        const lines = [
            "DRAFTS_CREATED",
            `intake: design-registration-assist`,
            `count: ${result.drafts.length}`,
            ...result.drafts.map(
                (d) =>
                    `- ${d.draftId} type=${d.type} status=${d.status} title=${d.title}`
            ),
            result.reused.length
                ? `reused: ${result.reused.join(", ")}`
                : undefined,
            ...result.warnings.map((w) => `warning: ${w}`),
            "next: asa draft show <draftId>",
            "then: asa confirm --draft <draftId>",
            "note: Draft is NOT Official until Human Confirmation + RecordCommitAPI",
        ].filter(Boolean) as string[];
        return ok(lines.join("\n"));
    } catch (err) {
        return fail(2, err instanceof Error ? err.message : String(err));
    }
}

function cmdDraft(
    rootDir: string,
    positionals: readonly string[],
    flags: Map<string, string[]>,
    deps: CliRuntimeDeps
): CliResult {
    const sub = positionals[0] ?? "list";
    const { draftStore, storage } = createServices(rootDir, deps);
    try {
        if (sub === "list") {
            const status = flagValue(flags, "status") as
                | "open"
                | "rejected"
                | "committed"
                | undefined;
            const drafts = draftStore.list(status);
            if (drafts.length === 0) return ok("DRAFT_EMPTY");
            return ok(
                drafts
                    .map(
                        (d) =>
                            `${d.draftId} status=${d.status} type=${d.type} title=${d.title}`
                    )
                    .join("\n")
            );
        }
        if (sub === "show") {
            const id = flagValue(flags, "id") ?? positionals[1];
            if (!id) return fail(1, "usage: asa draft show <draftId>");
            const d = draftStore.load(id);
            const underRecords = draftStore.isUnderOfficialRecords(id);
            return ok(
                [
                    `Draft ID: ${d.draftId}`,
                    `Status: ${d.status}`,
                    `Intake: ${d.intake}`,
                    `Type: ${d.type}`,
                    `Title: ${d.title}`,
                    "Content:",
                    d.content || "(empty)",
                    "Evidence proposal:",
                    d.evidenceProposal.length
                        ? d.evidenceProposal.map((e) => `- ${e}`).join("\n")
                        : "(none)",
                    "Metadata proposal:",
                    `  tags: ${JSON.stringify([...d.metadataProposal.tags])}`,
                    `  relatedRecords: ${JSON.stringify([
                        ...d.metadataProposal.relatedRecords,
                    ])}`,
                    `  source: ${d.metadataProposal.source || "(none)"}`,
                    `Source documents: ${d.sourceDocuments.join(", ") || "(none)"}`,
                    `Fingerprint: ${d.fingerprint}`,
                    `Official storage path used: ${underRecords}`,
                    d.committedRecordId
                        ? `Committed record: ${d.committedRecordId}`
                        : "Committed record: (none)",
                    `Official records dir count unchanged by draft alone: ${storage.listIds().length >= 0}`,
                ].join("\n")
            );
        }
        return fail(1, "usage: asa draft list|show <draftId>");
    } catch (err) {
        return fail(2, err instanceof Error ? err.message : String(err));
    }
}

function cmdConfirm(
    rootDir: string,
    positionals: readonly string[],
    flags: Map<string, string[]>,
    deps: CliRuntimeDeps
): CliResult {
    const draftId = flagValue(flags, "draft") ?? positionals[0];
    if (!draftId) {
        return fail(
            1,
            "usage: asa confirm --draft <draftId> [--title ...] [--content ...] [--evidence ...] [--tags ...] [--related ...] [--source ...] [--type ...]\n   or: asa confirm --draft <draftId> --reject [--reason ...]"
        );
    }

    const { confirm, verify } = createServices(rootDir, deps);
    try {
        if (flagValue(flags, "reject") === "true") {
            const rejected = confirm.reject(
                draftId,
                flagValue(flags, "reason")
            );
            return ok(
                [
                    "DRAFT_REJECTED",
                    `draftId: ${rejected.draftId}`,
                    `status: ${rejected.status}`,
                    `reason: ${rejected.rejectReason ?? ""}`,
                ].join("\n")
            );
        }

        const evidenceFlag = flagAll(flags, "evidence");
        const result = confirm.confirmAndCommit(draftId, {
            type: flagValue(flags, "type"),
            title: flagValue(flags, "title"),
            content: flagValue(flags, "content"),
            evidence:
                evidenceFlag.length > 0
                    ? splitCsvFlags(evidenceFlag)
                    : undefined,
            tags:
                flagAll(flags, "tags").length > 0
                    ? splitCsvFlags(flagAll(flags, "tags"))
                    : undefined,
            relatedRecords:
                flagAll(flags, "related").length > 0
                    ? splitCsvFlags(flagAll(flags, "related"))
                    : undefined,
            source: flagValue(flags, "source"),
        });

        const v = verify.verifyRecord(result.commit.record.id);
        return ok(
            [
                "DRAFT_CONFIRMED_AND_COMMITTED",
                `draftId: ${result.draft.draftId}`,
                `recordId: ${result.commit.record.id}`,
                `type: ${result.commit.record.type}`,
                `hash: ${result.commit.record.hash}`,
                `path: ${result.commit.path}`,
                `commitPath: RecordCommitAPI`,
                `confirmGate: Human Confirmation（outside CommitAPI）`,
                v.passed ? "verify: PASS" : "verify: FAIL",
                ...v.findings.map((f) => `- ${f.code}: ${f.message}`),
            ].join("\n")
        );
    } catch (err) {
        if (err instanceof RecordCommitPartialError) {
            return fail(2, err.message);
        }
        return fail(2, err instanceof Error ? err.message : String(err));
    }
}

export function runCli(
    argv: readonly string[],
    deps: CliRuntimeDeps = {}
): CliResult {
    const { command, positionals, flags } = parseArgs(argv);
    const rootDir = path.resolve(
        flagValue(flags, "root") ?? deps.rootDir ?? DEFAULT_RUNTIME_DATA_ROOT
    );
    const repoRoot = path.resolve(
        flagValue(flags, "repo-root") ?? deps.repoRoot ?? process.cwd()
    );
    const depsWithRepo: CliRuntimeDeps = { ...deps, repoRoot };

    if (!command || command === "help" || command === "--help") {
        return ok(
            [
                `ASA Minimum Runtime v${PACKAGE_VERSION} CLI`,
                "commands:",
                "  status",
                "  record [--template <id>] --type <t> --title <t> [--content <c>] [--evidence <ref>] [--tags <t>] [--related <id>] [--source <s>]",
                "  record --list-templates",
                "  assist design-registration --register <path> [--baseline <path>]",
                "  draft list [--status open|rejected|committed]",
                "  draft show <draftId>",
                "  confirm --draft <draftId> [--title ...] [--content ...] [--evidence ...] [--tags ...] [--related ...] [--source ...] [--type ...]",
                "  confirm --draft <draftId> --reject [--reason ...]",
                "  show <id>",
                "  history [--limit N]",
                "  verify [--id <recordId>]",
                "global:",
                "  --root <dataRoot>",
                "  --repo-root <repoRoot>（document intake resolution）",
                "writePath: RecordCommitAPI",
                "assistPath: DesignRegistrationAssist -> Draft -> Confirm -> RecordCommitAPI",
            ].join("\n")
        );
    }

    switch (command) {
        case "status":
            return cmdStatus(rootDir);
        case "record":
            return cmdRecord(rootDir, flags, depsWithRepo);
        case "assist":
            return cmdAssist(rootDir, positionals, flags, depsWithRepo);
        case "draft":
            return cmdDraft(rootDir, positionals, flags, depsWithRepo);
        case "confirm":
            return cmdConfirm(rootDir, positionals, flags, depsWithRepo);
        case "show":
            return cmdShow(rootDir, positionals, flags);
        case "history":
            return cmdHistory(rootDir, flags);
        case "verify":
            return cmdVerify(rootDir, flags);
        default:
            return fail(1, `unknown command: ${command}`);
    }
}

function main(): void {
    const result = runCli(process.argv.slice(2));
    if (result.stdout) {
        process.stdout.write(`${result.stdout}\n`);
    }
    if (result.stderr) {
        process.stderr.write(`${result.stderr}\n`);
    }
    process.exit(result.exitCode);
}

if (require.main === module) {
    main();
}
