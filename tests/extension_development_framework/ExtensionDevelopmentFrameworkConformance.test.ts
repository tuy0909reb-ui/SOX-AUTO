import { ExtensionGovernanceBuilder } from "../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFrameworkBuilder } from "../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";

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

function establishGovernance() {
    return new ExtensionGovernanceBuilder()
        .withGovernanceLayerId("egl-fw-conf")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression())
        .establish();
}

function sampleTemplate(): ExtensionTemplateContract {
    return Object.freeze({
        metadata: Object.freeze({
            id: "ASA-OPS",
            version: "1.0.0",
            domain: "OPS" as const,
            description: "OPS development standard template",
            governanceOwner: "ASA-GOV-OPS",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.ops.input.v1"]),
            processingBoundaryId: "ext.ops.processing.v1",
            outputContractIds: Object.freeze(["ext.ops.output.v1"]),
            errorContract: Object.freeze({
                errorType: "OPS_FAILURE",
                failureState: "FAILED",
                recoveryPolicy: "RETRY_THEN_HALT",
                notificationPolicy: "GOVERNANCE_NOTIFY",
            }),
            forbidsCoreMutation: true as const,
            forbidsGovernanceMutation: true as const,
        }),
        authority: Object.freeze({
            declaredAuthority: "OBSERVER" as const,
            approvedAuthority: "REQUESTER" as const,
            forbidsRuntimeEscalation: true as const,
        }),
        lifecycle: "STABLE" as const,
        dependency: Object.freeze([] as string[]),
        compatibility: Object.freeze({
            compatibleCore: "ASA-CORE-34.0" as const,
            compatibleGovernance: "ASA-ARCH-35.x",
            requiresVersionMatch: true as const,
            requiresContractMatch: true as const,
            requiresRuntimeValidation: true as const,
            requiresRegressionPass: true as const,
        }),
        validation: Object.freeze({
            stages: Object.freeze([
                "PROPOSAL",
                "CONTRACT_VALIDATION",
                "AUTHORITY_VALIDATION",
                "COMPATIBILITY_VALIDATION",
                "SECURITY_VALIDATION",
                "REGRESSION",
                "ACTIVE",
            ] as const),
        }),
        securityValidation: Object.freeze({
            permissionBoundaryRequired: true as const,
            dataAccessScopeRequired: true as const,
            externalCommunicationRequired: true as const,
            secretHandlingRequired: true as const,
            authorityComplianceRequired: true as const,
        }),
        regressionStandard: Object.freeze({
            unitTestRequired: true as const,
            contractTestRequired: true as const,
            integrationTestRequired: true as const,
            isolationTestRequired: true as const,
        }),
        communicationContract: Object.freeze({
            forbidsDirectInternalAccess: true as const,
            requiresBoundaryContract: true as const,
            requiresContractCompatibility: true as const,
            requiresVersionCompatibility: true as const,
            requiresAuthorityValidation: true as const,
        }),
        capabilityBinding: Object.freeze({
            bindingId: "bind.ops.capability.v1",
            capabilityContractId: "cap.ops.v1",
            forbidsDirectCapabilityMutation: true as const,
        }),
    });
}

describe("ASA-ARCH-35.1 — Extension Development Framework Conformance", () => {
    test("deterministic define yields equal structural JSON", () => {
        const governance = establishGovernance();
        const template = sampleTemplate();

        const a = new ExtensionDevelopmentFrameworkBuilder()
            .withFrameworkId("edf-conf")
            .withArchitectureVersion("ASA-ARCH-35.1")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withCreationTimestamp("2026-07-29T00:00:00Z")
            .withProducerIdentity("asa-test")
            .withSourceGovernanceLayer(governance)
            .withExtensionTemplate(template)
            .define();

        const b = new ExtensionDevelopmentFrameworkBuilder()
            .withFrameworkId("edf-conf")
            .withArchitectureVersion("ASA-ARCH-35.1")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withCreationTimestamp("2026-07-29T00:00:00Z")
            .withProducerIdentity("asa-test")
            .withSourceGovernanceLayer(governance)
            .withExtensionTemplate(template)
            .define();

        const serialize = (fw: typeof a) =>
            JSON.stringify({
                identity: fw.identity,
                metadata: fw.metadata,
                template: fw.extensionTemplate,
                governanceId: fw.sourceGovernanceLayer.identity.governanceLayerId,
            });

        expect(serialize(a)).toBe(serialize(b));
    });

    test("framework preserves Core and Governance contracts structurally", () => {
        const framework = new ExtensionDevelopmentFrameworkBuilder()
            .withFrameworkId("edf-preserve")
            .withArchitectureVersion("ASA-ARCH-35.1")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withSourceGovernanceLayer(establishGovernance())
            .withExtensionTemplate(sampleTemplate())
            .define();

        expect(framework.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(framework.sourceGovernanceLayer.identity.coreVersion).toBe(
            "ASA-CORE-34.0"
        );
        expect(framework.extensionTemplate.compatibility.compatibleCore).toBe(
            "ASA-CORE-34.0"
        );
        expect(
            framework.extensionTemplate.compatibility.compatibleGovernance
        ).toBe("ASA-ARCH-35.x");
        expect(framework.metadata.preservesCoreContract).toBe(true);
        expect(framework.metadata.preservesGovernanceContract).toBe(true);
    });

    test("Declared Authority may be strictly less than Approved Authority", () => {
        const framework = new ExtensionDevelopmentFrameworkBuilder()
            .withFrameworkId("edf-auth")
            .withArchitectureVersion("ASA-ARCH-35.1")
            .withStructuralVersion("0.2")
            .withSchemaVersion("0.2")
            .withSourceGovernanceLayer(establishGovernance())
            .withExtensionTemplate(sampleTemplate())
            .define();

        expect(framework.extensionTemplate.authority.declaredAuthority).toBe(
            "OBSERVER"
        );
        expect(framework.extensionTemplate.authority.approvedAuthority).toBe(
            "REQUESTER"
        );
        expect(
            framework.extensionTemplate.authority.forbidsRuntimeEscalation
        ).toBe(true);
    });
});
