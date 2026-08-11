import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
    ASA_MINIMUM_RUNTIME,
    HashService,
    JsonFileStorage,
    freezeRuntimeRecord,
    getRecordTemplate,
    listRecordTemplates,
    missingTemplateFields,
    toCanonicalJson,
} from "../../src/asa_minimum_runtime";
import { runCli } from "../../src/asa_minimum_runtime/cli";

describe("ASA Minimum Runtime v0.1.1 — templates / metadata / show", () => {
    let rootDir: string;

    beforeEach(() => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "asa-min-rt-011-"));
    });

    afterEach(() => {
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    test("package marker is 0.1.3（templates/metadata preserved）", () => {
        expect(ASA_MINIMUM_RUNTIME.version).toBe("0.1.3");
        expect(ASA_MINIMUM_RUNTIME.supportsTemplates).toBe(true);
        expect(ASA_MINIMUM_RUNTIME.supportsMetadata).toBe(true);
        expect(ASA_MINIMUM_RUNTIME.architectureAuthority).toBe("NONE");
    });

    test("templates define four record kinds", () => {
        const ids = listRecordTemplates().map((t) => t.id);
        expect(ids).toEqual([
            "architecture_record",
            "implementation_record",
            "verification_record",
            "decision_record",
        ]);
        const arch = getRecordTemplate("architecture_record");
        expect(arch?.requiredFields).toEqual(["title", "content", "evidence"]);
        expect(
            missingTemplateFields(arch!, {
                title: "t",
                content: "",
                evidence: [],
            })
        ).toEqual(["content", "evidence"]);
    });

    test("empty metadata preserves v0.1 canonical JSON", () => {
        const v01 = {
            id: "11111111-1111-4111-8111-111111111111",
            type: "NOTE",
            createdAt: "2026-08-01T07:20:00.000Z",
            title: "phase1-record",
            content: "deterministic payload",
            evidence: ["EVID-A", "EVID-B"],
            version: "1.0" as const,
        };
        const withEmpty = { ...v01, metadata: { tags: [], relatedRecords: [], source: "" } };
        expect(toCanonicalJson(v01)).toBe(toCanonicalJson(withEmpty));
        expect(toCanonicalJson(v01).includes('"metadata"')).toBe(false);
    });

    test("non-empty metadata enters hash and persists", () => {
        const base = {
            id: "33333333-3333-4333-8333-333333333333",
            type: "Implementation Record",
            createdAt: "2026-08-01T09:00:00.000Z",
            title: "meta-record",
            content: "with metadata",
            evidence: ["EVID-M1"],
            metadata: {
                tags: ["v0.1.1", "runtime"],
                relatedRecords: ["11111111-1111-4111-8111-111111111111"],
                source: "enhancement-test",
            },
            version: "1.0" as const,
        };
        const hashService = new HashService();
        const hash = hashService.hashPayload(base);
        const canonical = toCanonicalJson(base);
        expect(canonical).toContain('"metadata"');
        expect(canonical).toContain('"tags"');
        expect(canonical).toContain("enhancement-test");

        const record = freezeRuntimeRecord({ ...base, hash });
        const storage = new JsonFileStorage({ rootDir });
        storage.save(record);
        const loaded = storage.load(record.id);
        expect(loaded.metadata.tags).toEqual(["v0.1.1", "runtime"]);
        expect(loaded.metadata.relatedRecords).toEqual([
            "11111111-1111-4111-8111-111111111111",
        ]);
        expect(loaded.metadata.source).toBe("enhancement-test");
        expect(hashService.verifyRecordHash(loaded)).toBe(true);

        const withoutMetaHash = hashService.hashPayload({
            ...base,
            metadata: undefined,
        });
        expect(withoutMetaHash).not.toBe(hash);
    });

    test("asa record --template guides missing fields", () => {
        const result = runCli([
            "record",
            "--root",
            rootDir,
            "--template",
            "decision_record",
            "--title",
            "only-title",
        ]);
        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("template fields missing");
        expect(result.stderr).toContain("content");
        expect(result.stderr).toContain("evidence");
    });

    test("asa record --template creates typed record with metadata", () => {
        const created = runCli(
            [
                "record",
                "--root",
                rootDir,
                "--template",
                "architecture_record",
                "--title",
                "Arch note",
                "--content",
                "Architecture remains frozen",
                "--evidence",
                "ASA-ARCH-50.0",
                "--tags",
                "frozen,baseline",
                "--related",
                "cb4d9178-6bb6-4075-aa7d-7789d9bb4bef",
                "--source",
                "v0.1.1-test",
            ],
            {
                now: () => new Date("2026-08-01T10:00:00.000Z"),
                randomId: () => "44444444-4444-4444-8444-444444444444",
            }
        );
        expect(created.exitCode).toBe(0);
        expect(created.stdout).toContain("RECORD_CREATED");
        expect(created.stdout).toContain("template: architecture_record");
        expect(created.stdout).toContain("type: Architecture Record");

        const shown = runCli([
            "show",
            "44444444-4444-4444-8444-444444444444",
            "--root",
            rootDir,
        ]);
        expect(shown.exitCode).toBe(0);
        expect(shown.stdout).toContain("Record ID: 44444444-4444-4444-8444-444444444444");
        expect(shown.stdout).toContain("Type: Architecture Record");
        expect(shown.stdout).toContain("CreatedAt: 2026-08-01T10:00:00.000Z");
        expect(shown.stdout).toContain("Title: Arch note");
        expect(shown.stdout).toContain("Architecture remains frozen");
        expect(shown.stdout).toContain("- ASA-ARCH-50.0");
        expect(shown.stdout).toContain('"frozen"');
        expect(shown.stdout).toContain("v0.1.1-test");
        expect(shown.stdout).toContain("Hash:");
        expect(shown.stdout).toContain("Version: 1.0");

        const verify = runCli(["verify", "--root", rootDir]);
        expect(verify.exitCode).toBe(0);
        expect(verify.stdout).toContain("VERIFY_PASS");
    });

    test("asa show is read-only", () => {
        const created = runCli(
            [
                "record",
                "--root",
                rootDir,
                "--type",
                "NOTE",
                "--title",
                "show-only",
                "--content",
                "body",
            ],
            {
                now: () => new Date("2026-08-01T11:00:00.000Z"),
                randomId: () => "55555555-5555-4555-8555-555555555555",
            }
        );
        expect(created.exitCode).toBe(0);

        const before = fs.readFileSync(
            path.join(
                rootDir,
                "records",
                "55555555-5555-4555-8555-555555555555.json"
            ),
            "utf8"
        );
        const shown = runCli([
            "show",
            "55555555-5555-4555-8555-555555555555",
            "--root",
            rootDir,
        ]);
        expect(shown.exitCode).toBe(0);
        const after = fs.readFileSync(
            path.join(
                rootDir,
                "records",
                "55555555-5555-4555-8555-555555555555.json"
            ),
            "utf8"
        );
        expect(after).toBe(before);
    });
});
