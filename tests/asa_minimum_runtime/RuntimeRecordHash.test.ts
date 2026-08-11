import {
    ASA_MINIMUM_RUNTIME,
    HashService,
    RUNTIME_RECORD_VERSION,
    freezeRuntimeRecord,
    toCanonicalJson,
    toHashPayload,
} from "../../src/asa_minimum_runtime";

describe("ASA Minimum Runtime v0.1 — Phase 1 Models + Hash", () => {
    const basePayload = {
        id: "11111111-1111-4111-8111-111111111111",
        type: "NOTE",
        createdAt: "2026-08-01T07:20:00.000Z",
        title: "phase1-record",
        content: "deterministic payload",
        evidence: ["EVID-A", "EVID-B"],
        version: RUNTIME_RECORD_VERSION,
    } as const;

    test("package marker", () => {
        expect(ASA_MINIMUM_RUNTIME.packageId).toBe("asa_minimum_runtime");
        expect(ASA_MINIMUM_RUNTIME.version).toBe("0.1.3");
        expect(ASA_MINIMUM_RUNTIME.phase).toBe("0.1.3-assisted-loop-narrow");
        expect(ASA_MINIMUM_RUNTIME.architectureAuthority).toBe("NONE");
        expect(Object.isFrozen(ASA_MINIMUM_RUNTIME)).toBe(true);
    });

    test("record model freezes and rejects empty required fields", () => {
        const hashService = new HashService();
        const hash = hashService.hashPayload(basePayload);
        const record = freezeRuntimeRecord({ ...basePayload, hash });

        expect(record.version).toBe("1.0");
        expect(Object.isFrozen(record)).toBe(true);
        expect(Object.isFrozen(record.evidence)).toBe(true);
        expect(() =>
            freezeRuntimeRecord({ ...basePayload, title: "  ", hash })
        ).toThrow(/title/);
    });

    test("canonical JSON is key-sorted and excludes hash", () => {
        const canonical = toCanonicalJson(basePayload);
        expect(canonical).toBe(
            JSON.stringify({
                content: "deterministic payload",
                createdAt: "2026-08-01T07:20:00.000Z",
                evidence: ["EVID-A", "EVID-B"],
                id: "11111111-1111-4111-8111-111111111111",
                title: "phase1-record",
                type: "NOTE",
                version: "1.0",
            })
        );
        expect(canonical.includes('"hash"')).toBe(false);
    });

    test("hash is deterministic for identical payload", () => {
        const hashService = new HashService();
        const first = hashService.hashPayload(basePayload);
        const second = hashService.hashPayload({ ...basePayload });
        expect(first).toBe(second);
        expect(first).toMatch(/^[0-9a-f]{64}$/);
    });

    test("hash verification PASS / FAIL on tamper", () => {
        const hashService = new HashService();
        const hash = hashService.hashPayload(basePayload);
        const record = freezeRuntimeRecord({ ...basePayload, hash });

        expect(hashService.verifyRecordHash(record)).toBe(true);

        const tampered = freezeRuntimeRecord({
            ...basePayload,
            content: "tampered",
            hash,
        });
        expect(hashService.verifyRecordHash(tampered)).toBe(false);

        const payload = toHashPayload(record);
        expect(hashService.hashPayload(payload)).toBe(record.hash);
    });
});
