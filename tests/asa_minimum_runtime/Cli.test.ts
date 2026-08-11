import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { runCli } from "../../src/asa_minimum_runtime/cli";

describe("ASA Minimum Runtime v0.1 — Phase 4 CLI", () => {
    let rootDir: string;

    beforeEach(() => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "asa-min-rt-cli-"));
    });

    afterEach(() => {
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    test("status / record / history / verify flow", () => {
        const status = runCli(["status", "--root", rootDir]);
        expect(status.exitCode).toBe(0);
        expect(status.stdout).toContain("status: OK");
        expect(status.stdout).toContain("ASA Minimum Runtime v0.1.3");
        expect(status.stdout).toContain("records: 0");

        const record = runCli(
            [
                "record",
                "--root",
                rootDir,
                "--type",
                "NOTE",
                "--title",
                "cli-flow",
                "--content",
                "hello-runtime",
                "--evidence",
                "EVID-CLI-1",
            ],
            {
                now: () => new Date("2026-08-01T08:00:00.000Z"),
                randomId: () => "22222222-2222-4222-8222-222222222222",
            }
        );
        expect(record.exitCode).toBe(0);
        expect(record.stdout).toContain("RECORD_CREATED");
        expect(record.stdout).toContain(
            "id: 22222222-2222-4222-8222-222222222222"
        );

        const history = runCli(["history", "--root", rootDir]);
        expect(history.exitCode).toBe(0);
        expect(history.stdout).toContain(
            "id=22222222-2222-4222-8222-222222222222"
        );

        const verify = runCli(["verify", "--root", rootDir]);
        expect(verify.exitCode).toBe(0);
        expect(verify.stdout).toContain("VERIFY_PASS");

        const filePath = path.join(
            rootDir,
            "records",
            "22222222-2222-4222-8222-222222222222.json"
        );
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
            content: string;
        };
        parsed.content = "tampered";
        fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, 2)}\n`);

        const verifyFail = runCli([
            "verify",
            "--root",
            rootDir,
            "--id",
            "22222222-2222-4222-8222-222222222222",
        ]);
        expect(verifyFail.exitCode).toBe(1);
        expect(verifyFail.stdout).toContain("VERIFY_FAIL");
        expect(verifyFail.stdout).toContain("HASH_MISMATCH");
    });

    test("record requires type and title", () => {
        const result = runCli(["record", "--root", rootDir, "--type", "NOTE"]);
        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("usage:");
    });
});
