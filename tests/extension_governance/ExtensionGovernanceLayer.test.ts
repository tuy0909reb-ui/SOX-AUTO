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
        permittedOperationIds: Object.freeze([
            "exchange.context.read",
            "submit.recommendation",
            "submit.action.request",
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

export function sampleGovernanceLayer(): ExtensionGovernanceLayer {
    return new ExtensionGovernanceBuilder()
        .withGovernanceLayerId("egl.pipeline.v1")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression())
        .establish();
}

describe("ASA-ARCH-35.0 — ExtensionGovernanceLayer", () => {
    test("immutable layer preserves Core 34.0 and Extension Boundary Contract", () => {
        const layer = sampleGovernanceLayer();

        expect(layer).toBeInstanceOf(ExtensionGovernanceLayer);
        expect(Object.isFrozen(layer)).toBe(true);
        expect(Object.isFrozen(layer.identity)).toBe(true);
        expect(Object.isFrozen(layer.metadata)).toBe(true);
        expect(layer.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(layer.metadata.governanceStatus).toBe("established");
        expect(layer.metadata.corePreservationRequired).toBe(true);
        expect(layer.extensionBoundaryContract.forbidsDirectCoreMutation).toBe(
            true
        );
        expect(
            layer.extensionBoundaryContract.forbidsAdministratorAuthority
        ).toBe(true);
        expect(layer.extensionDescriptors).toHaveLength(3);
        expect(Object.keys(layer).sort()).toEqual([
            "compatibilityMatrix",
            "extensionBoundaryContract",
            "extensionDescriptors",
            "identity",
            "metadata",
            "regressionBoundary",
        ]);
        expect(layer).not.toHaveProperty("runtime");
        expect(layer).not.toHaveProperty("executor");
        expect(layer).not.toHaveProperty("administrator");
    });

    test("serialization compatibility — declarative JSON without runtime fields", () => {
        const layer = sampleGovernanceLayer();
        const serialized = JSON.stringify(layer);
        expect(serialized).not.toMatch(/runtime/i);
        expect(serialized).not.toMatch(/scheduler/i);
        expect(serialized).not.toMatch(/ADMINISTRATOR/);
        expect(JSON.parse(serialized).identity.governanceLayerId).toBe(
            "egl.pipeline.v1"
        );
    });
});
