import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
    ASA_MINIMUM_RUNTIME,
    ConfirmService,
    DesignRegistrationAssist,
    DraftStore,
    HashService,
    HistoryService,
    JsonFileStorage,
    RecordCommitAPI,
    VerifyService,
} from "../../src/asa_minimum_runtime";
import { runCli } from "../../src/asa_minimum_runtime/cli";

const FIXTURE_REPO = path.resolve(
    __dirname,
    "fixtures"
);
const REGISTER_REL =
    "docs/reports/ASA-REGISTER-ASSIST-FIXTURE-1.0.md";
const BASELINE_REL = "docs/baselines/ASA-ASSIST-FIXTURE-1.0.md";

describe("ASA Minimum Runtime v0.1.3 — Assisted Loop Narrow", () => {
    let rootDir: string;
    let draftStore: DraftStore;
    let storage: JsonFileStorage;
    let history: HistoryService;
    let commitApi: RecordCommitAPI;
    let verify: VerifyService;
    let assist: DesignRegistrationAssist;
    let confirm: ConfirmService;

    beforeEach(() => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "asa-aln-"));
        storage = new JsonFileStorage({ rootDir });
        history = new HistoryService({ rootDir });
        const hashService = new HashService();
        draftStore = new DraftStore({
            rootDir,
            now: () => new Date("2026-08-11T10:00:00.000Z"),
            randomId: () => "draft-aaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        });
        commitApi = new RecordCommitAPI({
            storage,
            history,
            hashService,
            now: () => new Date("2026-08-11T10:05:00.000Z"),
            randomId: () => "record-bbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        });
        verify = new VerifyService({ storage, hashService, history });
        assist = new DesignRegistrationAssist({
            draftStore,
            repoRoot: FIXTURE_REPO,
            now: () => new Date("2026-08-11T10:00:00.000Z"),
            randomId: () => "draft-aaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        });
        confirm = new ConfirmService({
            draftStore,
            commitApi,
            now: () => new Date("2026-08-11T10:05:00.000Z"),
        });
    });

    afterEach(() => {
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    test("package marker is 0.1.3 assisted-loop-narrow", () => {
        expect(ASA_MINIMUM_RUNTIME.version).toBe("0.1.3");
        expect(ASA_MINIMUM_RUNTIME.supportsAssistedLoopNarrow).toBe(true);
        expect(ASA_MINIMUM_RUNTIME.supportsDesignRegistrationAssist).toBe(
            true
        );
        expect(ASA_MINIMUM_RUNTIME.decisionAuthority).toBe("NONE");
    });

    test("Draft generation with evidence/metadata proposals; not Official", () => {
        // Second draft needs distinct id
        let n = 0;
        const store = new DraftStore({
            rootDir,
            randomId: () => {
                n += 1;
                return `draft-${n}ccc-cccc-4ccc-8ccc-cccccccccccc`;
            },
            now: () => new Date("2026-08-11T10:00:00.000Z"),
        });
        const a = new DesignRegistrationAssist({
            draftStore: store,
            repoRoot: FIXTURE_REPO,
            randomId: () => {
                n += 1;
                return `draft-${n}ddd-dddd-4ddd-8ddd-dddddddddddd`;
            },
        });
        const result = a.createDrafts({
            registerPath: REGISTER_REL,
            baselinePath: BASELINE_REL,
        });
        expect(result.drafts.length).toBe(2);
        const decision = result.drafts.find((d) =>
            d.type.includes("Decision")
        )!;
        expect(decision.status).toBe("open");
        expect(decision.evidenceProposal.length).toBeGreaterThan(0);
        expect(decision.evidenceProposal.some((e) => e.includes("ASA-REGISTER"))).toBe(
            true
        );
        expect(decision.metadataProposal.source).toContain("ASA-REGISTER");
        expect(decision.metadataProposal.tags).toContain("design-registration");
        expect(storage.listIds()).toEqual([]);
        expect(history.list()).toHaveLength(0);
        expect(fs.existsSync(path.join(rootDir, "drafts"))).toBe(true);
        const draftFiles = fs.readdirSync(path.join(rootDir, "drafts"));
        expect(draftFiles.length).toBe(2);
        expect(
            fs.existsSync(
                path.join(rootDir, "records", `${decision.draftId}.json`)
            )
        ).toBe(false);
    });

    test("Confirm required before Official; Confirm then Commit+Verify PASS", () => {
        let n = 0;
        const store = new DraftStore({
            rootDir,
            randomId: () => {
                n += 1;
                return `d${n}eeeeeee-eeee-4eee-8eee-eeeeeeeeeeee`;
            },
        });
        let r = 0;
        const api = new RecordCommitAPI({
            storage,
            history,
            hashService: new HashService(),
            randomId: () => {
                r += 1;
                return `r${r}fffffff-ffff-4fff-8fff-ffffffffffff`;
            },
            now: () => new Date("2026-08-11T11:00:00.000Z"),
        });
        const a = new DesignRegistrationAssist({
            draftStore: store,
            repoRoot: FIXTURE_REPO,
            randomId: () => {
                n += 1;
                return `d${n}eeeeeee-eeee-4eee-8eee-eeeeeeeeeeee`;
            },
        });
        const c = new ConfirmService({ draftStore: store, commitApi: api });
        const created = a.createDrafts({ registerPath: REGISTER_REL });
        expect(storage.listIds()).toEqual([]);

        const decision = created.drafts.find((d) =>
            d.type.includes("Decision")
        )!;
        expect(decision.type).toContain("Decision");

        const committed = c.confirmAndCommit(decision.draftId);
        expect(committed.commit.record.id).toBeTruthy();
        expect(storage.exists(committed.commit.record.id)).toBe(true);
        expect(history.list().some((e) => e.id === committed.commit.record.id)).toBe(
            true
        );
        expect(verify.verifyRecord(committed.commit.record.id).passed).toBe(
            true
        );
        expect(store.load(decision.draftId).status).toBe("committed");
    });

    test("reject draft does not commit", () => {
        let n = 0;
        const store = new DraftStore({
            rootDir,
            randomId: () => {
                n += 1;
                return `rj${n}aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`;
            },
        });
        const a = new DesignRegistrationAssist({
            draftStore: store,
            repoRoot: FIXTURE_REPO,
            randomId: () => {
                n += 1;
                return `rj${n}aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`;
            },
        });
        const c = new ConfirmService({ draftStore: store, commitApi });
        const created = a.createDrafts({ registerPath: REGISTER_REL });
        const d = created.drafts[0]!;
        c.reject(d.draftId, "not now");
        expect(() => c.confirmAndCommit(d.draftId)).toThrow(/rejected/);
        expect(storage.listIds()).toEqual([]);
    });

    test("fingerprint reuse warns without deleting", () => {
        let n = 0;
        const store = new DraftStore({
            rootDir,
            randomId: () => {
                n += 1;
                return `fp${n}bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb`;
            },
        });
        const a = new DesignRegistrationAssist({
            draftStore: store,
            repoRoot: FIXTURE_REPO,
            randomId: () => {
                n += 1;
                return `fp${n}bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb`;
            },
        });
        const first = a.createDrafts({ registerPath: REGISTER_REL });
        const second = a.createDrafts({ registerPath: REGISTER_REL });
        expect(second.reused.length).toBe(2);
        expect(second.warnings.length).toBeGreaterThan(0);
        expect(store.list("open").length).toBe(first.drafts.length);
    });

    test("CLI integration: assist → draft → confirm → verify", () => {
        let draftSeq = 0;
        let recordSeq = 0;
        const deps = {
            repoRoot: FIXTURE_REPO,
            now: () => new Date("2026-08-11T12:00:00.000Z"),
            randomId: () => {
                // assist/draft/confirm share randomId; alternate namespaces via counter
                draftSeq += 1;
                if (draftSeq <= 2) {
                    return `cli-draft-${draftSeq}111-4111-8111-111111111111`;
                }
                recordSeq += 1;
                return `cli-rec-${recordSeq}2222-4222-8222-222222222222`;
            },
        };

        const assist = runCli(
            [
                "assist",
                "design-registration",
                "--root",
                rootDir,
                "--register",
                REGISTER_REL,
                "--baseline",
                BASELINE_REL,
            ],
            deps
        );
        expect(assist.exitCode).toBe(0);
        expect(assist.stdout).toContain("DRAFTS_CREATED");
        expect(assist.stdout).toContain("Decision Record");

        const list = runCli(["draft", "list", "--root", rootDir], deps);
        expect(list.exitCode).toBe(0);
        expect(list.stdout).toContain("status=open");

        const draftIds = list.stdout
            .split("\n")
            .map((l) => l.split(" ")[0]!)
            .filter(Boolean);

        for (const id of draftIds) {
            const confirmed = runCli(
                ["confirm", "--draft", id, "--root", rootDir],
                {
                    ...deps,
                    randomId: () => {
                        recordSeq += 1;
                        return `cli-rec-${recordSeq}2222-4222-8222-222222222222`;
                    },
                }
            );
            expect(confirmed.exitCode).toBe(0);
            expect(confirmed.stdout).toContain(
                "DRAFT_CONFIRMED_AND_COMMITTED"
            );
            expect(confirmed.stdout).toContain("commitPath: RecordCommitAPI");
            expect(confirmed.stdout).toContain("verify: PASS");
        }

        const verifyAll = runCli(["verify", "--root", rootDir]);
        expect(verifyAll.exitCode).toBe(0);
        expect(verifyAll.stdout).toContain("VERIFY_PASS");

        const status = runCli(["status", "--root", rootDir]);
        expect(status.stdout).toContain("ASA Minimum Runtime v0.1.3");
        expect(status.stdout).toContain("official: 2");
        expect(status.stdout).toContain("assistPath:");
    });

    test("rejects non-register intake paths", () => {
        expect(() =>
            assist.createDrafts({
                registerPath: BASELINE_REL,
            })
        ).toThrow(/ASA-REGISTER/);
    });
});
