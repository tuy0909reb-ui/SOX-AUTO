import * as fs from "fs";
import * as path from "path";
import { AsaAiLayer } from "../../../src/extensions/asa_ai/AsaAiLayer";
import { AiValidator } from "../../../src/extensions/asa_ai/AiValidator";
import {
    baseAiValidator,
    sampleAiExtensionContract,
    sampleMemory,
    sampleProposal,
    sampleSelection,
} from "./aiFixtures";

const SRC_DIR = path.resolve(__dirname, "../../../src/extensions/asa_ai");

describe("ASA-ARCH-38.0 — AiValidator", () => {
    test("establish constructs immutable AI layer", () => {
        const layer = baseAiValidator().establish();
        expect(layer).toBeInstanceOf(AsaAiLayer);
        expect(Object.isFrozen(layer)).toBe(true);
        expect(layer.identity.extensionId).toBe("ASA-AI");
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.extensionContract.authority).toBe("ADVISOR");
        expect(layer.extensionContract.proposalIsNotExecution).toBe(true);
        expect(layer.metadata.preservesOpsContract).toBe(true);
        expect(layer.metadata.preservesConnectContract).toBe(true);
    });

    test("establishment rejects missing Framework", () => {
        expect(() =>
            new AiValidator()
                .withLayerId("ai-1")
                .withArchitectureVersion("ASA-ARCH-38.0")
                .withStructuralVersion("0.5")
                .withSchemaVersion("0.5")
                .withExtensionContract(sampleAiExtensionContract())
                .establish()
        ).toThrow(
            /exactly one source Extension Development Framework is required/
        );
    });

    test("establishment rejects non-ADVISOR authority", () => {
        expect(() =>
            baseAiValidator()
                .withExtensionContract(
                    Object.freeze({
                        ...sampleAiExtensionContract(),
                        authority: "EXECUTOR" as "ADVISOR",
                    })
                )
                .establish()
        ).toThrow(/Authority Declaration must be ADVISOR/);
    });

    test("establishment rejects proposal that allows execution command", () => {
        expect(() =>
            baseAiValidator()
                .withProposalContract(
                    Object.freeze({
                        ...sampleProposal(),
                        forbidsExecutionCommand: false as true,
                    })
                )
                .establish()
        ).toThrow(/Proposal Boundary flags invalid/);
    });

    test("establishment rejects memory that is part of Core State", () => {
        expect(() =>
            baseAiValidator()
                .withMemoryContract(
                    Object.freeze({
                        ...sampleMemory(),
                        neverPartOfCoreState: false as true,
                    })
                )
                .establish()
        ).toThrow(/Memory Isolation \/ Ownership/);
    });

    test("establishment rejects selection that allows autonomous execution", () => {
        expect(() =>
            baseAiValidator()
                .withProviderSelection(
                    Object.freeze({
                        ...sampleSelection(),
                        forbidsAutonomousExecution: false as true,
                    })
                )
                .establish()
        ).toThrow(/Provider Selection Contract invalid/);
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

    test("production sources do not import construction / asa_ops / asa_connect packages", () => {
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
            expect(body).not.toMatch(/extensions\/asa_ops/);
            expect(body).not.toMatch(/extensions\/asa_connect/);
        }
    });
});
