import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
    HashService,
    JsonFileStorage,
    freezeRuntimeRecord,
} from "../../src/asa_minimum_runtime";

describe("ASA Minimum Runtime v0.1 — Phase 2 JSON Storage", () => {
    let rootDir: string;
    let storage: JsonFileStorage;

    beforeEach(() => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "asa-min-rt-"));
        storage = new JsonFileStorage({ rootDir });
    });

    afterEach(() => {
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    function makeRecord(id: string, content = "storage-payload") {
        const base = {
            id,
            type: "NOTE",
            createdAt: "2026-08-01T07:30:00.000Z",
            title: "storage-test",
            content,
            evidence: ["EVID-S1"],
            version: "1.0" as const,
        };
        const hash = new HashService().hashPayload(base);
        return freezeRuntimeRecord({ ...base, hash });
    }

    test("save and load round-trip under records/", () => {
        const record = makeRecord("rec-001");
        const savedPath = storage.save(record);

        expect(savedPath).toBe(
            path.join(rootDir, "records", "rec-001.json")
        );
        expect(fs.existsSync(savedPath)).toBe(true);

        const loaded = storage.load("rec-001");
        expect(loaded).toEqual(record);
        expect(new HashService().verifyRecordHash(loaded)).toBe(true);
    });

    test("append-oriented create rejects overwrite", () => {
        const record = makeRecord("rec-002");
        storage.save(record);
        expect(() => storage.save(record)).toThrow(/already exists/);
    });

    test("listIds returns sorted ids", () => {
        storage.save(makeRecord("rec-b"));
        storage.save(makeRecord("rec-a"));
        expect(storage.listIds()).toEqual(["rec-a", "rec-b"]);
    });

    test("load missing record fails", () => {
        expect(() => storage.load("missing")).toThrow(/not found/);
    });
});
