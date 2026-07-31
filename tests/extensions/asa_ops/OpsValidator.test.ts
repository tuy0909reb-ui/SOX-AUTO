import * as fs from "fs";
import * as path from "path";
import { AsaOpsLayer } from "../../../src/extensions/asa_ops/AsaOpsLayer";
import type { OpsExecutionTraceContract } from "../../../src/extensions/asa_ops/OpsExecutionTrace";
import { OpsValidator } from "../../../src/extensions/asa_ops/OpsValidator";
import {
    baseOpsValidator,
    sampleAudit,
    sampleExecutionTrace,
    sampleHealth,
    sampleOpsExtensionContract,
} from "./opsFixtures";

const SRC_DIR = path.resolve(__dirname, "../../../src/extensions/asa_ops");

describe("ASA-ARCH-36.0 — OpsValidator", () => {
    test("establish constructs immutable OPS layer", () => {
        const layer = baseOpsValidator().establish();
        expect(layer).toBeInstanceOf(AsaOpsLayer);
        expect(Object.isFrozen(layer)).toBe(true);
        expect(layer.identity.extensionId).toBe("ASA-OPS");
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.extensionContract.authority).toBe("OBSERVER");
        expect(layer.metadata.preservesCoreContract).toBe(true);
        expect(layer.metadata.preservesGovernanceContract).toBe(true);
        expect(layer.metadata.preservesFrameworkContract).toBe(true);
    });

    test("establishment rejects missing Framework", () => {
        expect(() =>
            new OpsValidator()
                .withLayerId("ops-1")
                .withArchitectureVersion("ASA-ARCH-36.0")
                .withStructuralVersion("0.4")
                .withSchemaVersion("0.4")
                .withExtensionContract(sampleOpsExtensionContract())
                .establish()
        ).toThrow(
            /exactly one source Extension Development Framework is required/
        );
    });

    test("establishment rejects non-OBSERVER authority", () => {
        expect(() =>
            baseOpsValidator()
                .withExtensionContract(
                    Object.freeze({
                        ...sampleOpsExtensionContract(),
                        authority: "ADVISOR" as "OBSERVER",
                    })
                )
                .establish()
        ).toThrow(/Authority Declaration must be OBSERVER/);
    });

    test("establishment rejects incomplete audit integrity fields", () => {
        expect(() =>
            baseOpsValidator()
                .withAudit(
                    Object.freeze({
                        ...sampleAudit(),
                        requiredFields: Object.freeze({
                            ...sampleAudit().requiredFields,
                            why: false as true,
                        }),
                    })
                )
                .establish()
        ).toThrow(/Audit required fields incomplete/);
    });

    test("establishment rejects health that alters execution permission", () => {
        expect(() =>
            baseOpsValidator()
                .withHealth(
                    Object.freeze({
                        ...sampleHealth(),
                        forbidsExecutionPermissionChange: false as true,
                    })
                )
                .establish()
        ).toThrow(/must not alter Execution Permission/);
    });

    test("establishment rejects incomplete execution trace stages", () => {
        expect(() =>
            baseOpsValidator()
                .withExecutionTrace(
                    Object.freeze({
                        ...sampleExecutionTrace(),
                        stages: Object.freeze([
                            "REQUEST",
                            "RESULT",
                        ] as ("REQUEST" | "RESULT")[]),
                    }) as OpsExecutionTraceContract
                )
                .establish()
        ).toThrow(/Execution Trace stages are incomplete/);
    });

    test("no prohibited behavioral / runtime APIs", () => {
        const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".ts"));
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(
                /\bfunction\s+(select|discover|resolve|load|lookup|bind|schedule|analyzeDependencies|planConstruction|optimize|traverse|interpret)\b/
            );
            expect(body).not.toMatch(/from\s+["'].*runtime_execution/);
            expect(body).not.toMatch(/from\s+["'].*orchestration/);
            expect(body).not.toMatch(/\basync\b/);
            expect(body).not.toMatch(/\bfetch\b|\bhttp\b/);
            expect(body).not.toMatch(/getInstance\s*\(/);
        }
    });

    test("production sources do not import Chapters 25–34 construction packages", () => {
        const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".ts"));
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            expect(body).not.toMatch(/construction_plan\//);
            expect(body).not.toMatch(/construction_planning_/);
            expect(body).not.toMatch(
                /construction_structural_responsibility_boundary/
            );
            expect(body).not.toMatch(
                /construction_responsibility_structural_/
            );
        }
    });
});
