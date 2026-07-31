import * as fs from "fs";
import * as path from "path";
import { ExtensionGovernanceLayer } from "../../src/extension_governance/ExtensionGovernanceLayer";
import { ExtensionGovernanceBuilder } from "../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../src/extension_governance/ExtensionGovernanceTypes";

function sampleBoundaryContract(): ExtensionBoundaryContract {
    return Object.freeze({
        contractId: "ext.boundary.contract.v1",
        coreVersion: "ASA-CORE-34.0",
        architectureVersion: "ASA-ARCH-35.0",
        structuralVersion: "0.3",
        isolation: true as const,
        permittedOperationIds: Object.freeze(["exchange.context.read"]),
        forbidsDirectCoreMutation: true as const,
        forbidsAdministratorAuthority: true as const,
    });
}

function sampleDescriptors(): ExtensionDescriptor[] {
    return [
        Object.freeze({
            id: "ASA-OPS",
            version: "1.0.0",
            domain: "OPS" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze(["ASA-AI"] as string[]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "OBSERVER" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
        Object.freeze({
            id: "ASA-AI",
            version: "1.0.0",
            domain: "AI" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze(["ASA-OPS"] as string[]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "ADVISOR" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
    ];
}

function sampleMatrix(): ExtensionCompatibilityMatrixEntry[] {
    return [
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-OPS",
            extensionVersionRange: "1.x",
            contractVersion: "1.0.0",
        }),
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-AI",
            extensionVersionRange: "1.x",
            contractVersion: "1.0.0",
        }),
    ];
}

function sampleRegression(): ExtensionRegressionBoundary {
    return Object.freeze({
        coreRegressionRequired: true as const,
        extensionRegressionRequired: true as const,
        integrationRegressionRequired: true as const,
        isolationRegressionRequired: true as const,
    });
}

function baseBuilder(): ExtensionGovernanceBuilder {
    return new ExtensionGovernanceBuilder()
        .withGovernanceLayerId("egl-ok")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression());
}

const SRC_DIR = path.resolve(__dirname, "../../src/extension_governance");

describe("ASA-ARCH-35.0 — ExtensionGovernanceBuilder", () => {
    test("establish constructs immutable governance layer", () => {
        const layer = baseBuilder().establish();
        expect(layer).toBeInstanceOf(ExtensionGovernanceLayer);
        expect(Object.isFrozen(layer)).toBe(true);
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
    });

    test("establishment rejects missing Boundary Contract", () => {
        expect(() =>
            new ExtensionGovernanceBuilder()
                .withGovernanceLayerId("egl-1")
                .withArchitectureVersion("ASA-ARCH-35.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
                .withExtensionDescriptors(sampleDescriptors())
                .withCompatibilityMatrix(sampleMatrix())
                .withRegressionBoundary(sampleRegression())
                .establish()
        ).toThrow(/Extension Boundary Contract is required/);
    });

    test("establishment rejects Core version other than ASA-CORE-34.0", () => {
        expect(() =>
            baseBuilder()
                .withExtensionBoundaryContract(
                    Object.freeze({
                        ...sampleBoundaryContract(),
                        coreVersion: "ASA-CORE-33.0",
                    })
                )
                .establish()
        ).toThrow(/must preserve ASA-CORE-34\.0/);
    });

    test("establishment rejects invalid Extension Identifier", () => {
        const descriptors = sampleDescriptors();
        descriptors[0] = Object.freeze({
            ...descriptors[0],
            id: "INVALID",
        });
        expect(() =>
            baseBuilder().withExtensionDescriptors(descriptors).establish()
        ).toThrow(/invalid Extension Identifier Contract/);
    });

    test("establishment rejects ASA-AI with EXECUTOR authority", () => {
        const descriptors = sampleDescriptors();
        descriptors[1] = Object.freeze({
            ...descriptors[1],
            authority: "EXECUTOR" as const,
        });
        expect(() =>
            baseBuilder().withExtensionDescriptors(descriptors).establish()
        ).toThrow(/AI Authority Restriction/);
    });

    test("establishment rejects missing Regression Boundary", () => {
        expect(() =>
            new ExtensionGovernanceBuilder()
                .withGovernanceLayerId("egl-1")
                .withArchitectureVersion("ASA-ARCH-35.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
                .withExtensionBoundaryContract(sampleBoundaryContract())
                .withExtensionDescriptors(sampleDescriptors())
                .withCompatibilityMatrix(sampleMatrix())
                .establish()
        ).toThrow(/Regression Boundary is required/);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ExtensionGovernanceLayer.ts",
            "ExtensionGovernanceBuilder.ts",
            "ExtensionGovernanceTypes.ts",
        ];
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
        const files = [
            "ExtensionGovernanceLayer.ts",
            "ExtensionGovernanceBuilder.ts",
            "ExtensionGovernanceTypes.ts",
        ];
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
