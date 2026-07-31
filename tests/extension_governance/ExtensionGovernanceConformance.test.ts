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
        permittedOperationIds: Object.freeze([
            "exchange.context.read",
            "submit.recommendation",
        ]),
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
                compatibleExtensionIds: Object.freeze([
                    "ASA-AI",
                    "ASA-CONNECT",
                ]),
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
                compatibleExtensionIds: Object.freeze([
                    "ASA-OPS",
                    "ASA-CONNECT",
                ]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "ADVISOR" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
        Object.freeze({
            id: "ASA-CONNECT",
            version: "1.0.0",
            domain: "CONNECT" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze([
                    "ASA-OPS",
                    "ASA-AI",
                ]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "REQUESTER" as const,
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
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-CONNECT",
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

describe("ASA-ARCH-35.0 — Extension Governance Conformance", () => {
    test("preserves authority separation and AI restriction", () => {
        const layer = new ExtensionGovernanceBuilder()
            .withGovernanceLayerId("egl-conformance")
            .withArchitectureVersion("ASA-ARCH-35.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withExtensionBoundaryContract(sampleBoundaryContract())
            .withExtensionDescriptors(sampleDescriptors())
            .withCompatibilityMatrix(sampleMatrix())
            .withRegressionBoundary(sampleRegression())
            .establish();

        const byId = Object.fromEntries(
            layer.extensionDescriptors.map((d) => [d.id, d])
        );
        expect(byId["ASA-OPS"].authority).toBe("OBSERVER");
        expect(byId["ASA-AI"].authority).toBe("ADVISOR");
        expect(byId["ASA-CONNECT"].authority).toBe("REQUESTER");
        expect(
            layer.extensionDescriptors.every((d) => d.isolation === true)
        ).toBe(true);
    });

    test("Executor authority is separated from decision authority structurally", () => {
        const descriptors = sampleDescriptors();
        descriptors[2] = Object.freeze({
            ...descriptors[2],
            authority: "EXECUTOR" as const,
        });

        const layer = new ExtensionGovernanceBuilder()
            .withGovernanceLayerId("egl-executor")
            .withArchitectureVersion("ASA-ARCH-35.0")
            .withStructuralVersion("0.3")
            .withSchemaVersion("0.3")
            .withExtensionBoundaryContract(sampleBoundaryContract())
            .withExtensionDescriptors(descriptors)
            .withCompatibilityMatrix(sampleMatrix())
            .withRegressionBoundary(sampleRegression())
            .establish();

        expect(
            layer.extensionDescriptors.find((d) => d.id === "ASA-CONNECT")
                ?.authority
        ).toBe("EXECUTOR");
        expect(layer.extensionBoundaryContract.forbidsAdministratorAuthority).toBe(
            true
        );
        expect(layer).not.toHaveProperty("decisionAuthority");
    });

    test("establishment is deterministic for the same inputs", () => {
        const build = () =>
            new ExtensionGovernanceBuilder()
                .withGovernanceLayerId("egl-det")
                .withArchitectureVersion("ASA-ARCH-35.0")
                .withStructuralVersion("0.3")
                .withSchemaVersion("0.3")
                .withExtensionBoundaryContract(sampleBoundaryContract())
                .withExtensionDescriptors(sampleDescriptors())
                .withCompatibilityMatrix(sampleMatrix())
                .withRegressionBoundary(sampleRegression())
                .establish();

        expect(JSON.stringify(build())).toBe(JSON.stringify(build()));
    });
});
