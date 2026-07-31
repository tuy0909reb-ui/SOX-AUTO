import * as fs from "fs";
import * as path from "path";
import { ExtensionGovernanceBuilder } from "../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFramework } from "../../src/extension_development_framework/ExtensionDevelopmentFramework";
import { ExtensionDevelopmentFrameworkBuilder } from "../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";

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

function establishGovernance() {
    return new ExtensionGovernanceBuilder()
        .withGovernanceLayerId("egl-fw-source")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression())
        .establish();
}

function sampleTemplate(
    overrides?: Partial<ExtensionTemplateContract>
): ExtensionTemplateContract {
    const base: ExtensionTemplateContract = {
        metadata: Object.freeze({
            id: "ASA-OPS",
            version: "1.0.0",
            domain: "OPS",
            description: "Operations extension template sample",
            governanceOwner: "ASA-GOV-OPS",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.input.v1"]),
            processingBoundaryId: "ext.processing.ops.v1",
            outputContractIds: Object.freeze(["ext.output.v1"]),
            errorContract: Object.freeze({
                errorType: "EXTENSION_FAILURE",
                failureState: "FAILED",
                recoveryPolicy: "RETRY_THEN_HALT",
                notificationPolicy: "GOVERNANCE_NOTIFY",
            }),
            forbidsCoreMutation: true,
            forbidsGovernanceMutation: true,
        }),
        authority: Object.freeze({
            declaredAuthority: "OBSERVER",
            approvedAuthority: "OBSERVER",
            forbidsRuntimeEscalation: true,
        }),
        lifecycle: "DESIGNED",
        dependency: Object.freeze([] as string[]),
        compatibility: Object.freeze({
            compatibleCore: "ASA-CORE-34.0",
            compatibleGovernance: "ASA-ARCH-35.x",
            requiresVersionMatch: true,
            requiresContractMatch: true,
            requiresRuntimeValidation: true,
            requiresRegressionPass: true,
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
            permissionBoundaryRequired: true,
            dataAccessScopeRequired: true,
            externalCommunicationRequired: true,
            secretHandlingRequired: true,
            authorityComplianceRequired: true,
        }),
        regressionStandard: Object.freeze({
            unitTestRequired: true,
            contractTestRequired: true,
            integrationTestRequired: true,
            isolationTestRequired: true,
        }),
        communicationContract: Object.freeze({
            forbidsDirectInternalAccess: true,
            requiresBoundaryContract: true,
            requiresContractCompatibility: true,
            requiresVersionCompatibility: true,
            requiresAuthorityValidation: true,
        }),
        capabilityBinding: Object.freeze({
            bindingId: "bind.ops.capability.v1",
            capabilityContractId: "cap.ops.v1",
            forbidsDirectCapabilityMutation: true,
        }),
    };
    return Object.freeze({ ...base, ...overrides }) as ExtensionTemplateContract;
}

function baseBuilder(): ExtensionDevelopmentFrameworkBuilder {
    return new ExtensionDevelopmentFrameworkBuilder()
        .withFrameworkId("edf-ok")
        .withArchitectureVersion("ASA-ARCH-35.1")
        .withStructuralVersion("0.2")
        .withSchemaVersion("0.2")
        .withSourceGovernanceLayer(establishGovernance())
        .withExtensionTemplate(sampleTemplate());
}

const SRC_DIR = path.resolve(
    __dirname,
    "../../src/extension_development_framework"
);

describe("ASA-ARCH-35.1 — ExtensionDevelopmentFrameworkBuilder", () => {
    test("define constructs immutable development framework", () => {
        const framework = baseBuilder().define();
        expect(framework).toBeInstanceOf(ExtensionDevelopmentFramework);
        expect(Object.isFrozen(framework)).toBe(true);
        expect(framework.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(framework.metadata.preservesGovernanceContract).toBe(true);
        expect(framework.metadata.preservesCoreContract).toBe(true);
        expect(framework.metadata.frameworkStatus).toBe("defined");
    });

    test("definition rejects missing Governance Layer", () => {
        expect(() =>
            new ExtensionDevelopmentFrameworkBuilder()
                .withFrameworkId("edf-1")
                .withArchitectureVersion("ASA-ARCH-35.1")
                .withStructuralVersion("0.2")
                .withSchemaVersion("0.2")
                .withExtensionTemplate(sampleTemplate())
                .define()
        ).toThrow(/exactly one source Governance Layer is required/);
    });

    test("definition rejects missing Extension Template", () => {
        expect(() =>
            new ExtensionDevelopmentFrameworkBuilder()
                .withFrameworkId("edf-1")
                .withArchitectureVersion("ASA-ARCH-35.1")
                .withStructuralVersion("0.2")
                .withSchemaVersion("0.2")
                .withSourceGovernanceLayer(establishGovernance())
                .define()
        ).toThrow(/Extension Template Contract is required/);
    });

    test("definition rejects Declared Authority > Approved Authority", () => {
        expect(() =>
            baseBuilder()
                .withExtensionTemplate(
                    sampleTemplate({
                        authority: Object.freeze({
                            declaredAuthority: "EXECUTOR",
                            approvedAuthority: "ADVISOR",
                            forbidsRuntimeEscalation: true,
                        }),
                    })
                )
                .define()
        ).toThrow(/Declared Authority must be <= Approved Authority/);
    });

    test("definition rejects ASA-AI with EXECUTOR declared authority", () => {
        expect(() =>
            baseBuilder()
                .withExtensionTemplate(
                    sampleTemplate({
                        metadata: Object.freeze({
                            id: "ASA-AI",
                            version: "1.0.0",
                            domain: "AI",
                            description: "AI template",
                            governanceOwner: "ASA-GOV-AI",
                        }),
                        authority: Object.freeze({
                            declaredAuthority: "EXECUTOR",
                            approvedAuthority: "EXECUTOR",
                            forbidsRuntimeEscalation: true,
                        }),
                    })
                )
                .define()
        ).toThrow(/AI Authority Restriction/);
    });

    test("definition rejects self circular dependency", () => {
        expect(() =>
            baseBuilder()
                .withExtensionTemplate(
                    sampleTemplate({
                        dependency: Object.freeze(["ASA-OPS"]),
                    })
                )
                .define()
        ).toThrow(/circular dependency is forbidden/);
    });

    test("definition rejects incompatible Core version", () => {
        expect(() =>
            baseBuilder()
                .withExtensionTemplate(
                    sampleTemplate({
                        compatibility: Object.freeze({
                            compatibleCore: "ASA-CORE-33.0" as "ASA-CORE-34.0",
                            compatibleGovernance: "ASA-ARCH-35.x",
                            requiresVersionMatch: true,
                            requiresContractMatch: true,
                            requiresRuntimeValidation: true,
                            requiresRegressionPass: true,
                        }),
                    })
                )
                .define()
        ).toThrow(/Compatible Core must be ASA-CORE-34\.0/);
    });

    test("definition rejects incomplete validation pipeline", () => {
        expect(() =>
            baseBuilder()
                .withExtensionTemplate(
                    sampleTemplate({
                        validation: Object.freeze({
                            stages: Object.freeze([
                                "PROPOSAL",
                                "ACTIVE",
                            ] as ("PROPOSAL" | "ACTIVE")[]),
                        }),
                    }) as ExtensionTemplateContract
                )
                .define()
        ).toThrow(/Validation Pipeline stages are incomplete/);
    });

    test("no prohibited behavioral / runtime / planning APIs", () => {
        const files = [
            "ExtensionDevelopmentFramework.ts",
            "ExtensionDevelopmentFrameworkBuilder.ts",
            "ExtensionDevelopmentFrameworkTypes.ts",
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
            "ExtensionDevelopmentFramework.ts",
            "ExtensionDevelopmentFrameworkBuilder.ts",
            "ExtensionDevelopmentFrameworkTypes.ts",
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

    test("production sources import extension_governance only as upstream", () => {
        const files = [
            "ExtensionDevelopmentFramework.ts",
            "ExtensionDevelopmentFrameworkBuilder.ts",
            "ExtensionDevelopmentFrameworkTypes.ts",
        ];
        for (const file of files) {
            const body = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
            const imports = body.match(/from\s+["'][^"']+["']/g) || [];
            for (const imp of imports) {
                if (
                    imp.includes("extension_development_framework") ||
                    imp.includes("./ExtensionDevelopmentFramework")
                ) {
                    continue;
                }
                expect(imp).toMatch(/extension_governance/);
            }
        }
    });
});
