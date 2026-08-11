import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
    HashService,
    HistoryService,
    JsonFileStorage,
    VerifyService,
    freezeRuntimeRecord,
} from "../../src/asa_minimum_runtime";

describe("ASA Minimum Runtime v0.1 — Phase 3 History + Verify", () => {
    let rootDir: string;
    let storage: JsonFileStorage;
    let history: HistoryService;
    let verify: VerifyService;

    beforeEach(() => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "asa-min-rt-h-"));
        storage = new JsonFileStorage({ rootDir });
        history = new HistoryService({ rootDir });
        verify = new VerifyService({ storage, hashService: new HashService() });
    });

    afterEach(() => {
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    function makeRecord(id: string, content = "history-verify") {
        const base = {
            id,
            type: "NOTE",
            createdAt: "2026-08-01T07:40:00.000Z",
            title: "hv-test",
            content,
            evidence: ["EVID-H1"],
            version: "1.0" as const,
        };
        const hash = new HashService().hashPayload(base);
        return freezeRuntimeRecord({ ...base, hash });
    }

    test("history append and retrieval preserve order", () => {
        const a = makeRecord("rec-h1");
        const b = makeRecord("rec-h2");
        storage.save(a);
        history.appendRecordCreated({
            id: a.id,
            hash: a.hash,
            at: a.createdAt,
        });
        storage.save(b);
        history.appendRecordCreated({
            id: b.id,
            hash: b.hash,
            at: "2026-08-01T07:41:00.000Z",
        });

        const events = history.list();
        expect(events).toHaveLength(2);
        expect(events[0]!.id).toBe("rec-h1");
        expect(events[1]!.id).toBe("rec-h2");
        expect(
            fs.existsSync(path.join(rootDir, "history", "history.jsonl"))
        ).toBe(true);
    });

    test("verify PASS for intact record", () => {
        const record = makeRecord("rec-ok");
        storage.save(record);
        const result = verify.verifyRecord("rec-ok");
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
        expect(result.isInspectionOnly).toBe(true);
    });

    test("verify FAIL for missing record", () => {
        const result = verify.verifyRecord("missing-id");
        expect(result.passed).toBe(false);
        expect(result.findings[0]!.code).toBe("RECORD_MISSING");
    });

    test("verify FAIL for hash tamper", () => {
        const record = makeRecord("rec-tamper", "original");
        storage.save(record);

        const filePath = storage.recordPath("rec-tamper");
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
            content: string;
            hash: string;
        };
        parsed.content = "tampered-on-disk";
        fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, 2)}\n`);

        const result = verify.verifyRecord("rec-tamper");
        expect(result.passed).toBe(false);
        expect(result.findings.some((f) => f.code === "HASH_MISMATCH")).toBe(
            true
        );
    });
});
