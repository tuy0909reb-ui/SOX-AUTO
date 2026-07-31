import * as fs from "fs";
import * as path from "path";
import { AsaConnectLayer } from "../../../src/extensions/asa_connect/AsaConnectLayer";
import { ConnectValidator } from "../../../src/extensions/asa_connect/ConnectValidator";
import {
    baseConnectValidator,
    sampleConnectExtensionContract,
    sampleConnectors,
    sampleRouter,
    sampleSecretProtection,
} from "./connectFixtures";

const SRC_DIR = path.resolve(__dirname, "../../../src/extensions/asa_connect");

describe("ASA-ARCH-37.0 — ConnectValidator", () => {
    test("establish constructs immutable CONNECT layer", () => {
        const layer = baseConnectValidator().establish();
        expect(layer).toBeInstanceOf(AsaConnectLayer);
        expect(Object.isFrozen(layer)).toBe(true);
        expect(layer.identity.extensionId).toBe("ASA-CONNECT");
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.extensionContract.authority).toBe("REQUESTER");
        expect(layer.extensionContract.requesterIsNotExecutionAuthority).toBe(
            true
        );
        expect(layer.metadata.preservesOpsContract).toBe(true);
    });

    test("establishment rejects missing Framework", () => {
        expect(() =>
            new ConnectValidator()
                .withLayerId("connect-1")
                .withArchitectureVersion("ASA-ARCH-37.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
                .withExtensionContract(sampleConnectExtensionContract())
                .establish()
        ).toThrow(
            /exactly one source Extension Development Framework is required/
        );
    });

    test("establishment rejects non-REQUESTER authority", () => {
        expect(() =>
            baseConnectValidator()
                .withExtensionContract(
                    Object.freeze({
                        ...sampleConnectExtensionContract(),
                        authority: "EXECUTOR" as "REQUESTER",
                    })
                )
                .establish()
        ).toThrow(/Authority Declaration must be REQUESTER/);
    });

    test("establishment rejects routing that permits workflow selection", () => {
        expect(() =>
            baseConnectValidator()
                .withRouter(
                    Object.freeze({
                        ...sampleRouter(),
                        forbidsWorkflowSelection: false as true,
                    })
                )
                .establish()
        ).toThrow(/Routing Restriction flags invalid/);
    });

    test("establishment rejects secret ownership claim", () => {
        expect(() =>
            baseConnectValidator()
                .withSecretProtection(
                    Object.freeze({
                        ...sampleSecretProtection(),
                        isNotSecretOwnership: false as true,
                    })
                )
                .establish()
        ).toThrow(/Secret Ownership Separation/);
    });

    test("establishment rejects missing connector type", () => {
        expect(() =>
            baseConnectValidator()
                .withConnectors(sampleConnectors().slice(0, 3))
                .establish()
        ).toThrow(/Connector type NOTIFICATION is required/);
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

    test("production sources do not import Ch25–34 construction or asa_ops packages", () => {
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
        }
    });
});
