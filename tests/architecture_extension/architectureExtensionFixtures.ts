/**
 * ASA-ARCH-45.0 — test fixtures
 * Declarative frozen objects only. No activation / authority paths.
 */

import {
    CompatibilityStatus,
    LifecycleDeclarationState,
    approvalReferenceAssociationFromContract,
    createApprovalReference,
    createApprovalTimestampReference,
    createApprovedObjectReference,
    createApprovedVersionReference,
    createCompatibleBoundaryReference,
    createContractVersionReference,
    createCreationReference,
    createExtensionIdentifier,
    createExtensionName,
    createExtensionVersionReference,
    createIdentityHashReference,
    freezeArchitectureRegistrationReference,
    freezeBoundaryRelationshipReference,
    freezeExtensionApprovalReference,
    freezeExtensionApprovalReferenceContract,
    freezeExtensionAuthorityBoundaryContract,
    freezeExtensionBoundary,
    freezeExtensionBoundaryContract,
    freezeExtensionCompatibilityReference,
    freezeExtensionContractCompatibilityReference,
    freezeExtensionDependencyBoundaryContract,
    freezeExtensionIdentity,
    freezeExtensionIdentityContract,
    freezeExtensionLifecycleDeclarationContract,
    freezeExtensionRegistryRecord,
    freezeExtensionResponsibilityDeclaration,
    freezeExtensionResponsibilityDeclarationModel,
    freezeExtensionSupersessionReference,
    type ExtensionIdentifier,
} from "../../src/architecture_extension";

export const EXT_ID: ExtensionIdentifier =
    createExtensionIdentifier("ext-asa-boundary-001");

export function sampleIdentityContract() {
    return freezeExtensionIdentityContract({
        extensionId: EXT_ID,
        extensionName: createExtensionName("BoundaryAssuranceSample"),
        extensionVersionReference: createExtensionVersionReference("0.2.0"),
        creationReference: createCreationReference("create-ref-001"),
        identityHashReference: createIdentityHashReference("hash-ref-001"),
    });
}

export function sampleIdentityModel() {
    return freezeExtensionIdentity({
        extensionId: EXT_ID,
        extensionName: createExtensionName("BoundaryAssuranceSample"),
        extensionVersionReference: createExtensionVersionReference("0.2.0"),
        creationReference: createCreationReference("create-ref-001"),
        identityHashReference: createIdentityHashReference("hash-ref-001"),
    });
}

export function sampleApprovalContract() {
    return freezeExtensionApprovalReferenceContract({
        approvedObjectReference: createApprovedObjectReference(
            "ASA-ARCH-45.0"
        ),
        approvedVersionReference: createApprovedVersionReference("0.2"),
        approvalTimestampReference: createApprovalTimestampReference(
            "2026-07-31T20:46:54+09:00"
        ),
    });
}

export function sampleResponsibility() {
    return freezeExtensionResponsibilityDeclaration({
        responsibilityDomain: "Extension Boundary Assurance",
        providedCapability: "Boundary declaration and reference integrity",
    });
}

export function sampleBoundaryContract() {
    return freezeExtensionBoundaryContract({
        extensionId: EXT_ID,
        extensionContractReference: "ExtensionBoundaryContract/0.3",
        responsibilityDeclaration: sampleResponsibility(),
        isolationConstraints: Object.freeze([
            "No Core modification",
            "No authority ownership",
        ]),
        boundaryApprovalReference: sampleApprovalContract(),
    });
}

export function sampleBoundary() {
    const responsibility = freezeExtensionResponsibilityDeclarationModel({
        responsibilityDomain: "Extension Boundary Assurance",
        providedCapability: "Boundary declaration and reference integrity",
    });
    const approvalAssociation = approvalReferenceAssociationFromContract(
        EXT_ID,
        sampleApprovalContract()
    );
    return freezeExtensionBoundary({
        extensionId: EXT_ID,
        extensionContractReference: "ExtensionBoundaryContract/0.3",
        responsibilityDeclaration: responsibility,
        isolationConstraints: Object.freeze([
            "No Core modification",
            "No authority ownership",
        ]),
        boundaryApprovalAssociation: approvalAssociation,
    });
}

export function sampleAuthorityContract() {
    return freezeExtensionAuthorityBoundaryContract();
}

export function sampleDependencyContract() {
    return freezeExtensionDependencyBoundaryContract({
        dependencyReferenceDeclaration:
            "ASA Boundary provides contracts; Extension consumes declarations",
    });
}

export function sampleLifecycleContract() {
    return freezeExtensionLifecycleDeclarationContract();
}

export function sampleCompatibilityContract() {
    return freezeExtensionContractCompatibilityReference({
        contractVersionReference: createContractVersionReference("0.3"),
        compatibleBoundaryReference: createCompatibleBoundaryReference(
            "ASA-ARCH-45.0-boundary"
        ),
        compatibilityStatusReference: CompatibilityStatus.COMPATIBLE,
    });
}

export function sampleSupersessionContract() {
    return freezeExtensionSupersessionReference({
        previousExtensionReference: createExtensionIdentifier("ext-prev-001"),
        supersedingExtensionReference: createExtensionIdentifier(
            "ext-next-001"
        ),
        supersessionApprovalReference: createApprovalReference(
            "ASA-AUTH-SUPERSEDE-001"
        ),
    });
}

export function sampleApprovalReferenceObject() {
    return freezeExtensionApprovalReference({
        referenceToken: createApprovalReference("approval-token-001"),
        extensionId: EXT_ID,
        approvedObjectReference: createApprovedObjectReference(
            "ASA-ARCH-45.0"
        ),
        approvedVersionReference: createApprovedVersionReference("0.2"),
        approvalTimestampReference: createApprovalTimestampReference(
            "2026-07-31T20:46:54+09:00"
        ),
    });
}

export function sampleCompatibilityReferenceObject() {
    return freezeExtensionCompatibilityReference({
        extensionId: EXT_ID,
        contractVersionReference: createContractVersionReference("0.3"),
        compatibleBoundaryReference: createCompatibleBoundaryReference(
            "ASA-ARCH-45.0-boundary"
        ),
        compatibilityStatusReference: CompatibilityStatus.COMPATIBLE,
    });
}

export function sampleBoundaryRelationship() {
    return freezeBoundaryRelationshipReference({
        toExtension: EXT_ID,
        dependencyReferenceDeclaration:
            "ASA Boundary provides contracts; Extension consumes declarations",
    });
}

export function sampleRegistrationReference() {
    return freezeArchitectureRegistrationReference({
        architectureId: "ASA-ARCH-45.0",
        registrationId: "ASA-REGISTER-ARCH-45.0-001",
        extensionId: EXT_ID,
        registrationArtifactReference:
            "docs/reports/ASA-REGISTER-ARCH-45.0-001.md",
    });
}

export function sampleRegistryRecord(
    integrityReference = "integrity-ref-001"
) {
    return freezeExtensionRegistryRecord({
        extensionId: EXT_ID,
        versionReference: "0.2.0",
        declarationState: LifecycleDeclarationState.REGISTERED,
        contractReference: "ExtensionBoundaryContract/0.3",
        approvalReference: "approval-token-001",
        integrityReference,
    });
}

/** Selected frozen-layer digest expectations (Ch35/42/43/44). */
export const FROZEN_LAYER_DIGEST_EXPECTATIONS: readonly {
    layer: "Ch35" | "Ch42" | "Ch43" | "Ch44";
    artifactPath: string;
    expectedSha256: string;
}[] = Object.freeze([
    {
        layer: "Ch35",
        artifactPath: "src/extension_governance/ExtensionGovernanceTypes.ts",
        expectedSha256:
            "2ef85a745ee7b68e660c2f358f93bac1a6c9e9dd52566c1fd466ec6b24c0fdb1",
    },
    {
        layer: "Ch35",
        artifactPath: "src/extension_governance/ExtensionGovernanceLayer.ts",
        expectedSha256:
            "fd68aad6ef98eba2c1a5bebf79a6c49318ab491be68a304d01cc2d904349821d",
    },
    {
        layer: "Ch35",
        artifactPath: "src/extension_governance/ExtensionGovernanceBuilder.ts",
        expectedSha256:
            "c23e83abe95dbdcdd36c922a8ef10271212ecaff39785dfa466527415ee31d97",
    },
    {
        layer: "Ch42",
        artifactPath:
            "src/architecture_evolution/ArchitectureEvolutionBuilder.ts",
        expectedSha256:
            "6a6e964421aa08896eb3969b166b7a2ad99d1b33cd5801940aca71e83fc3106e",
    },
    {
        layer: "Ch42",
        artifactPath: "src/architecture_evolution/ArchitectureEvolutionLayer.ts",
        expectedSha256:
            "efd7cb4e4145f0505dcf49dcc412a4472a30f50984e3c76768389473bf2e04cf",
    },
    {
        layer: "Ch42",
        artifactPath: "src/architecture_evolution/ValidationRules.ts",
        expectedSha256:
            "184842c68b58a070a52f81778ac8c962f0ce3a5f567f87ff26859a01938181ec",
    },
    {
        layer: "Ch42",
        artifactPath: "src/architecture_evolution/EvolutionProposal.ts",
        expectedSha256:
            "20ed07479deb62cc1c72dbc112d6290f6bfa9025b89cc8cb8340ce5bd6f2bb48",
    },
    {
        layer: "Ch43",
        artifactPath:
            "src/architecture_validation/ArchitectureValidationBuilder.ts",
        expectedSha256:
            "944eefb253e29b7286b564a23383dff1132eff18231e2f75150c3b3b41803928",
    },
    {
        layer: "Ch43",
        artifactPath:
            "src/architecture_validation/ArchitectureValidationLayer.ts",
        expectedSha256:
            "961a17713ddb661f18bb4f0c0ebbfe0a2207c562fb8e8a7fd10f8ec49205764b",
    },
    {
        layer: "Ch43",
        artifactPath: "src/architecture_validation/ValidationRules.ts",
        expectedSha256:
            "794fad41c6142597d4a2756f5630c7591385123155ad0ebcd11161bad886b6d0",
    },
    {
        layer: "Ch43",
        artifactPath: "src/architecture_validation/ValidationRuleEngine.ts",
        expectedSha256:
            "64675e1c8d444ea536c37d2102483ab7e37241ebeca78baebec455bdfd459f4f",
    },
    {
        layer: "Ch44",
        artifactPath: "src/architecture_operations/index.ts",
        expectedSha256:
            "ed17c353b92bd4aa5903969c0326e3c1cb8a8b552b5019be09a079ef6f008b76",
    },
    {
        layer: "Ch44",
        artifactPath:
            "src/architecture_operations/lifecycle/LifecycleTransitionValidator.ts",
        expectedSha256:
            "fee78e44189c7ceb03cfa93744de173ad390b4274647e1a1900fbf8ad3a82003",
    },
    {
        layer: "Ch44",
        artifactPath:
            "src/architecture_operations/lifecycle/LifecycleOperation.ts",
        expectedSha256:
            "b18ea000c9fd064f5bb712ba0d8fcafa8d4ccb87464fd1fc58791eac4881b23f",
    },
    {
        layer: "Ch44",
        artifactPath:
            "src/architecture_operations/registry/ArchitectureRegistry.ts",
        expectedSha256:
            "04488260b6ba960e865dca8afdc74090e2f72ea9086bd3163d737eec354c6cd9",
    },
    {
        layer: "Ch44",
        artifactPath:
            "src/architecture_operations/compliance/AuthorityBoundaryValidator.ts",
        expectedSha256:
            "feba41766b40ce77b4ec75859a5330ad6683b5d7d9dec0fe002935f666842186",
    },
]);
