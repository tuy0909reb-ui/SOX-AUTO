import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
    ASA_MINIMUM_RUNTIME,
    HashService,
    HistoryService,
    JsonFileStorage,
    RecordCommitAPI,
    RecordCommitPartialError,
    VerifyService,
    freezeRuntimeRecord,
} from "../../src/asa_minimum_runtime";
import { runCli } from "../../src/asa_minimum_runtime/cli";

describe("ASA Minimum Runtime — Write Discipline Slice", () => {
    let rootDir: string;
    let storage: JsonFileStorage;
    let history: HistoryService;
    let hashService: HashService;
    let commitApi: RecordCommitAPI;
    let verify: VerifyService;

    beforeEach(() => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "asa-wd-"));
        storage = new JsonFileStorage({ rootDir });
        history = new HistoryService({ rootDir });
        hashService = new HashService();
        commitApi = new RecordCommitAPI({
            storage,
            history,
            hashService,
            now: () => new Date("2026-08-11T00:00:00.000Z"),
            randomId: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        });
        verify = new VerifyService({ storage, hashService, history });
    });

    afterEach(() => {
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    test("package marker retains Write Discipline capabilities", () => {
        expect(ASA_MINIMUM_RUNTIME.supportsRecordCommitAPI).toBe(true);
        expect(ASA_MINIMUM_RUNTIME.supportsHistoryAwareVerify).toBe(true);
    });

    test("CommitAPI creates Official record（storage+history+hash PASS）", () => {
        const result = commitApi.commit({
            type: "Decision Record",
            title: "wd-commit",
            content: "write-discipline",
            evidence: ["EVID-WD-1"],
            metadata: { source: "unit-test", tags: ["wd"] },
        });
        expect(result.record.id).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
        expect(storage.exists(result.record.id)).toBe(true);
        expect(history.list()).toHaveLength(1);
        expect(history.list()[0]!.hash).toBe(result.record.hash);
        const v = verify.verifyRecord(result.record.id);
        expect(v.passed).toBe(true);
        expect(v.findings).toEqual([]);
    });

    test("CommitAPI is callable without CLI（future adapter shape）", () => {
        const api = new RecordCommitAPI({
            storage,
            history,
            hashService,
            randomId: () => "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            now: () => new Date("2026-08-11T01:00:00.000Z"),
        });
        const result = api.commit({
            type: "NOTE",
            title: "adapter-shaped",
            content: "not-cli",
            evidence: ["E1"],
        });
        expect(verify.verifyRecord(result.record.id).passed).toBe(true);
    });

    test("HISTORY_MISSING detected for storage-only orphan", () => {
        const base = {
            id: "orphan-storage-only",
            type: "NOTE",
            createdAt: "2026-08-11T02:00:00.000Z",
            title: "orphan",
            content: "no-history",
            evidence: ["E"],
            version: "1.0" as const,
        };
        const hash = hashService.hashPayload(base);
        storage.save(freezeRuntimeRecord({ ...base, hash }));

        const result = verify.verifyRecord("orphan-storage-only");
        expect(result.passed).toBe(false);
        expect(result.findings.some((f) => f.code === "HISTORY_MISSING")).toBe(
            true
        );
    });

    test("RECORD_FILE_MISSING detected for history-only id", () => {
        history.appendRecordCreated({
            id: "missing-file-id",
            hash: "0".repeat(64),
            at: "2026-08-11T03:00:00.000Z",
        });
        const result = verify.verifyRecord("missing-file-id");
        expect(result.passed).toBe(false);
        expect(
            result.findings.some((f) => f.code === "RECORD_FILE_MISSING")
        ).toBe(true);

        const all = verify.verifyAll();
        expect(
            all.findings.some(
                (f) =>
                    f.code === "RECORD_FILE_MISSING" &&
                    f.message.includes("missing-file-id")
            )
        ).toBe(true);
    });

    test("HISTORY_HASH_MISMATCH when history hash differs", () => {
        const result = commitApi.commit({
            type: "NOTE",
            title: "hash-mismatch-hist",
            content: "x",
            evidence: ["E"],
        });
        // Tamper history line by appending a second event with wrong hash
        // (append-only). Last wins in index → mismatch vs storage.
        history.appendRecordCreated({
            id: result.record.id,
            hash: "f".repeat(64),
            at: "2026-08-11T04:00:00.000Z",
        });
        const v = verify.verifyRecord(result.record.id);
        expect(v.passed).toBe(false);
        expect(
            v.findings.some((f) => f.code === "HISTORY_HASH_MISMATCH")
        ).toBe(true);
    });

    test("HASH_MISMATCH still detected", () => {
        const result = commitApi.commit({
            type: "NOTE",
            title: "tamper",
            content: "original",
            evidence: ["E"],
        });
        const filePath = storage.recordPath(result.record.id);
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
            content: string;
        };
        parsed.content = "tampered";
        fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, 2)}\n`);
        const v = verify.verifyRecord(result.record.id);
        expect(v.findings.some((f) => f.code === "HASH_MISMATCH")).toBe(true);
    });

    test("Verify without history stays hash-only compatible", () => {
        const legacy = new VerifyService({ storage, hashService });
        const base = {
            id: "legacy-ok",
            type: "NOTE",
            createdAt: "2026-08-11T05:00:00.000Z",
            title: "legacy",
            content: "ok",
            evidence: ["E"],
            version: "1.0" as const,
        };
        const hash = hashService.hashPayload(base);
        storage.save(freezeRuntimeRecord({ ...base, hash }));
        expect(legacy.verifyRecord("legacy-ok").passed).toBe(true);
    });

    test("CLI record uses CommitAPI and verifyAll PASS on fresh root", () => {
        const record = runCli(
            [
                "record",
                "--root",
                rootDir,
                "--type",
                "NOTE",
                "--title",
                "cli-wd",
                "--content",
                "via-api",
                "--evidence",
                "E-CLI",
            ],
            {
                now: () => new Date("2026-08-11T06:00:00.000Z"),
                randomId: () => "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            }
        );
        expect(record.exitCode).toBe(0);
        expect(record.stdout).toContain("commitPath: RecordCommitAPI");
        const verifyCli = runCli(["verify", "--root", rootDir]);
        expect(verifyCli.exitCode).toBe(0);
        expect(verifyCli.stdout).toContain("VERIFY_PASS");
        const status = runCli(["status", "--root", rootDir]);
        expect(status.stdout).toContain("official: 1");
        expect(status.stdout).toContain("writePath: RecordCommitAPI");
    });

    test("partial history failure leaves storage and surfaces COMMIT_PARTIAL_STORAGE", () => {
        const boomHistory = {
            appendRecordCreated: () => {
                throw new Error("append-boom");
            },
        } as unknown as HistoryService;
        const api = new RecordCommitAPI({
            storage,
            history: boomHistory,
            hashService,
            randomId: () => "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            now: () => new Date("2026-08-11T07:00:00.000Z"),
        });
        expect(() =>
            api.commit({
                type: "NOTE",
                title: "partial",
                content: "x",
                evidence: ["E"],
            })
        ).toThrow(RecordCommitPartialError);
        expect(storage.exists("dddddddd-dddd-4ddd-8ddd-dddddddddddd")).toBe(
            true
        );
    });

    test("duplicate ID rejected（no silent replace）", () => {
        commitApi.commit({
            type: "NOTE",
            title: "first",
            content: "a",
            evidence: ["E"],
            id: "dup-id-0001",
        });
        expect(() =>
            commitApi.commit({
                type: "NOTE",
                title: "second",
                content: "b",
                evidence: ["E"],
                id: "dup-id-0001",
            })
        ).toThrow(/already exists/);
        expect(history.list()).toHaveLength(1);
    });

    test("Storage failure does not append History", () => {
        const boomStorage = {
            rootDir: storage.rootDir,
            save: () => {
                throw new Error("save-boom");
            },
        } as unknown as JsonFileStorage;
        const api = new RecordCommitAPI({
            storage: boomStorage,
            history,
            hashService,
            randomId: () => "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
            now: () => new Date("2026-08-11T08:00:00.000Z"),
        });
        expect(() =>
            api.commit({
                type: "NOTE",
                title: "storage-fail",
                content: "x",
                evidence: ["E"],
            })
        ).toThrow(/save-boom/);
        expect(history.list()).toHaveLength(0);
    });

    test("invalid Record rejected before write", () => {
        expect(() =>
            commitApi.commit({
                type: "  ",
                title: "t",
                evidence: ["E"],
            })
        ).toThrow(/type must be non-empty/);
        expect(() =>
            commitApi.commit({
                type: "NOTE",
                title: "",
                evidence: ["E"],
            })
        ).toThrow(/title must be non-empty/);
        expect(storage.listIds()).toEqual([]);
        expect(history.list()).toHaveLength(0);
    });

    test("verifyAll mixed inventory reports PASS + RECORD_FILE_MISSING + HISTORY_MISSING + HASH_MISMATCH", () => {
        const ok = commitApi.commit({
            type: "NOTE",
            title: "ok",
            content: "good",
            evidence: ["E"],
            id: "mix-ok",
        });
        expect(verify.verifyRecord(ok.record.id).passed).toBe(true);

        const orphanBase = {
            id: "mix-orphan",
            type: "NOTE",
            createdAt: "2026-08-11T09:00:00.000Z",
            title: "orphan",
            content: "storage-only",
            evidence: ["E"],
            version: "1.0" as const,
        };
        storage.save(
            freezeRuntimeRecord({
                ...orphanBase,
                hash: hashService.hashPayload(orphanBase),
            })
        );

        history.appendRecordCreated({
            id: "mix-history-only",
            hash: "a".repeat(64),
            at: "2026-08-11T09:30:00.000Z",
        });

        const tampered = commitApi.commit({
            type: "NOTE",
            title: "will-tamper",
            content: "original",
            evidence: ["E"],
            id: "mix-tamper",
        });
        const filePath = storage.recordPath(tampered.record.id);
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
            content: string;
        };
        parsed.content = "tampered";
        fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, 2)}\n`);

        const all = verify.verifyAll();
        expect(all.passed).toBe(false);
        const codes = new Set(all.findings.map((f) => f.code));
        expect(codes.has("HISTORY_MISSING")).toBe(true);
        expect(codes.has("RECORD_FILE_MISSING")).toBe(true);
        expect(codes.has("HASH_MISMATCH")).toBe(true);
        expect(verify.verifyRecord("mix-ok").passed).toBe(true);
    });
});
