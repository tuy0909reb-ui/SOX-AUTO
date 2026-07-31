/**
 * ASA-ARCH-45.0 — Architecture verification tests
 * Deterministic / read-only / verification only.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
    ARCHITECTURE_EXTENSION_LAYER,
    ExtensionBoundaryValidator,
    ExtensionRegistry,
    detectProhibitedCapabilityTokens,
    detectReverseDependencyDeclaration,
    validateAllFrozenLayersPresent,
    validateApprovalReferenceAuthority,
    validateAuthorityBoundaryContract,
    validateBoundaryContract,
    validateBoundaryModel,
    validateBoundaryRelationshipReference,
    validateCompatibilityContract,
    validateCompatibilityReference,
    validateDecisionCapabilityAbsence,
    validateDependencyBoundaryContract,
    validateDeterministicLookup,
    validateIdentityConformity,
    validateIdentityContract,
    validateIdentityModel,
    validateRegistryIsolation,
    validateRegistryRecordIntegrity,
    validateResponsibilityExclusions,
    validateRuntimeCapabilityAbsence,
    type ExtensionIdentifier,
    type ExtensionRegistryReader,
    type ExtensionRegistryHistoryReader,
    type ExtensionRegistryRecord,
    type FrozenLayerDigestEvidence,
} from "../../src/architecture_extension";
import {
    EXT_ID,
    FROZEN_LAYER_DIGEST_EXPECTATIONS,
    sampleApprovalReferenceObject,
    sampleAuthorityContract,
    sampleBoundary,
    sampleBoundaryContract,
    sampleBoundaryRelationship,
    sampleCompatibilityContract,
    sampleCompatibilityReferenceObject,
    sampleDependencyContract,
    sampleIdentityContract,
    sampleIdentityModel,
    sampleLifecycleContract,
    sampleRegistrationReference,
    sampleRegistryRecord,
    sampleResponsibility,
    sampleSupersessionContract,
} from "./architectureExtensionFixtures";

const PKG_ROOT = path.resolve(__dirname, "../../src/architecture_extension");
const REPO_ROOT = path.resolve(__dirname, "../..");

const FORBIDDEN_IMPORT_FRAGMENTS = [
    "architecture_operations",
    "architecture_evolution",
    "architecture_validation",
    "extension_governance",
    "runtime_execution",
    "decision_layer",
    "extensions/asa_",
] as const;

function listTsFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...listTsFiles(full));
        } else if (entry.isFile() && entry.name.endsWith(".ts")) {
            out.push(full);
        }
    }
    return out;
}

function sha256File(relPath: string): string {
    const abs = path.join(REPO_ROOT, relPath);
    return crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex");
}

/** Read-only registry projection for integrity inspection without writer usage. */
function frozenReader(
    record: ExtensionRegistryRecord | null
): ExtensionRegistryReader {
    const records = record ? Object.freeze([record]) : Object.freeze([]);
    return Object.freeze({
        interfaceId: "ExtensionRegistryReader" as const,
        readOnly: true as const,
        doesNotOwnAuthority: true as const,
        doesNotActivateExtension: true as const,
        doesNotApproveExtension: true as const,
        getRecord: (id: ExtensionIdentifier) =>
            record && record.extensionId === id ? record : null,
        listRecords: () => records,
        hasRecord: (id: ExtensionIdentifier) =>
            !!record && record.extensionId === id,
    });
}

function emptyHistoryReader(): ExtensionRegistryHistoryReader {
    return Object.freeze({
        interfaceId: "ExtensionRegistryHistoryReader" as const,
        readOnly: true as const,
        doesNotOwnAuthority: true as const,
        doesNotActivateExtension: true as const,
        getHistory: () => Object.freeze([]),
        getLatestHistory: () => null,
    });
}

describe("ASA-ARCH-45.0 — Package isolation", () => {
    test("package isolation PASS — no Core / frozen-layer imports", () => {
        const files = listTsFiles(PKG_ROOT);
        expect(files.length).toBeGreaterThan(0);
        const violations: string[] = [];
        for (const file of files) {
            const text = fs.readFileSync(file, "utf8");
            for (const line of text.split(/\r?\n/)) {
                if (!line.includes("from ") && !line.includes("import ")) {
                    continue;
                }
                for (const frag of FORBIDDEN_IMPORT_FRAGMENTS) {
                    if (line.includes(frag)) {
                        violations.push(`${path.relative(PKG_ROOT, file)}: ${line.trim()}`);
                    }
                }
            }
        }
        expect(violations).toEqual([]);
    });

    test("public export integrity PASS", () => {
        expect(ARCHITECTURE_EXTENSION_LAYER.architectureId).toBe(
            "ASA-ARCH-45.0"
        );
        expect(ARCHITECTURE_EXTENSION_LAYER.packageIdentity).toBe(
            "architecture_extension"
        );
        expect(ARCHITECTURE_EXTENSION_LAYER.hasRuntimeIntegration).toBe(false);
        expect(ARCHITECTURE_EXTENSION_LAYER.hasDecisionCapability).toBe(false);
        expect(ARCHITECTURE_EXTENSION_LAYER.hasAuthorityOwnership).toBe(false);
        expect(ARCHITECTURE_EXTENSION_LAYER.extensionAuthority).toBe("NONE");
        expect(ARCHITECTURE_EXTENSION_LAYER.runtimeAuthority).toBe("NONE");
        expect(ARCHITECTURE_EXTENSION_LAYER.decisionAuthority).toBe("NONE");
    });
});

describe("ASA-ARCH-45.0 — Contract integrity", () => {
    test("contract integrity PASS", () => {
        expect(validateIdentityContract(sampleIdentityContract()).passed).toBe(
            true
        );
        expect(validateBoundaryContract(sampleBoundaryContract()).passed).toBe(
            true
        );
        expect(
            validateAuthorityBoundaryContract(sampleAuthorityContract()).passed
        ).toBe(true);
        expect(
            validateDependencyBoundaryContract(sampleDependencyContract())
                .passed
        ).toBe(true);
        expect(
            validateResponsibilityExclusions(sampleResponsibility()).passed
        ).toBe(true);
        expect(
            validateCompatibilityContract(sampleCompatibilityContract()).passed
        ).toBe(true);
        const lifecycle = sampleLifecycleContract();
        expect(lifecycle.isDeclarationDataOnly).toBe(true);
        expect(lifecycle.isNotRuntimeState).toBe(true);
        expect(lifecycle.forbidsActiveState).toBe(true);
        const supersession = sampleSupersessionContract();
        expect(supersession.requiresHumanArchitectAuthority).toBe(true);
        expect(supersession.forbidsSelfSupersession).toBe(true);
    });
});

describe("ASA-ARCH-45.0 — Immutable model verification", () => {
    test("immutable model verification PASS", () => {
        const identity = sampleIdentityModel();
        const boundary = sampleBoundary();
        expect(validateIdentityModel(identity).passed).toBe(true);
        expect(
            validateIdentityConformity(identity, sampleIdentityContract())
                .passed
        ).toBe(true);
        expect(validateBoundaryModel(boundary).passed).toBe(true);
        expect(identity.immutable).toBe(true);
        expect(boundary.immutable).toBe(true);
        expect(Object.isFrozen(identity)).toBe(true);
        expect(Object.isFrozen(boundary)).toBe(true);
    });
});

describe("ASA-ARCH-45.0 — Reference integrity", () => {
    test("reference integrity PASS", () => {
        const approval = sampleApprovalReferenceObject();
        const compatibility = sampleCompatibilityReferenceObject();
        const relationship = sampleBoundaryRelationship();
        const registration = sampleRegistrationReference();
        expect(validateApprovalReferenceAuthority(approval).passed).toBe(true);
        expect(validateCompatibilityReference(compatibility).passed).toBe(
            true
        );
        expect(
            validateBoundaryRelationshipReference(relationship).passed
        ).toBe(true);
        expect(approval.doesNotOwnAuthority).toBe(true);
        expect(compatibility.compatibilityDoesNotGrantAuthority).toBe(true);
        expect(relationship.forbidsReverseDependency).toBe(true);
        expect(registration.doesNotOwnAuthority).toBe(true);
        expect(Object.isFrozen(approval)).toBe(true);
    });
});

describe("ASA-ARCH-45.0 — Registry isolation", () => {
    test("registry isolation PASS", () => {
        const registry = new ExtensionRegistry();
        const reader = registry.asReader();
        const writer = registry.asWriter();
        const boundary = registry.asInteractionBoundary();
        expect(validateRegistryIsolation(reader).passed).toBe(true);
        expect(validateDeterministicLookup(reader).passed).toBe(true);
        expect(writer.storesReferencesOnly).toBe(true);
        expect(writer.doesNotApproveExtension).toBe(true);
        expect(writer.doesNotActivateExtension).toBe(true);
        expect(writer.doesNotExecuteExtension).toBe(true);
        expect(boundary.storesReferencesOnly).toBe(true);

        const record = sampleRegistryRecord();
        const projection = frozenReader(record);
        expect(
            validateRegistryRecordIntegrity(
                EXT_ID,
                projection,
                emptyHistoryReader()
            ).passed
        ).toBe(true);
    });
});

describe("ASA-ARCH-45.0 — Dependency isolation", () => {
    test("dependency isolation PASS", () => {
        expect(
            validateDependencyBoundaryContract(sampleDependencyContract())
                .passed
        ).toBe(true);
        expect(
            validateBoundaryRelationshipReference(sampleBoundaryRelationship())
                .passed
        ).toBe(true);
    });

    test("reverse dependency detection PASS", () => {
        const clean = detectReverseDependencyDeclaration(
            "ASA Boundary provides contracts; Extension consumes declarations"
        );
        expect(clean.passed).toBe(true);
        const reverse = detectReverseDependencyDeclaration(
            "Extension depends on ASA Core Internal layer"
        );
        expect(reverse.passed).toBe(false);
        expect(reverse.findings.length).toBeGreaterThan(0);
    });
});

describe("ASA-ARCH-45.0 — Runtime / decision / authority absence", () => {
    test("runtime capability absence PASS", () => {
        const boundary = sampleBoundary();
        expect(
            validateRuntimeCapabilityAbsence({
                forbidsRuntimeExecutionLogic:
                    boundary.forbidsRuntimeExecutionLogic,
                doesNotActivateExtension: true,
                doesNotExecuteExtension: true,
                forbidsActivate: true,
                forbidsEnable: true,
                forbidsActiveState: true,
            }).passed
        ).toBe(true);
        expect(
            detectProhibitedCapabilityTokens("REGISTERED DESIGNING APPROVED")
                .passed
        ).toBe(true);
        expect(detectProhibitedCapabilityTokens("ACTIVE").passed).toBe(false);
    });

    test("decision capability absence PASS", () => {
        expect(
            validateDecisionCapabilityAbsence({
                forbidsDecisionLogic: true,
                doesNotDecide: true,
                isInspectionOnly: true,
            }).passed
        ).toBe(true);
        const validator = new ExtensionBoundaryValidator();
        expect(validator.doesNotDecide).toBe(true);
        expect(validator.doesNotMutateRegistry).toBe(true);
        const identityResult = validator.inspectIdentity(sampleIdentityModel());
        expect(identityResult.passed).toBe(true);
        expect(identityResult.isInspectionOnly).toBe(true);
        expect(identityResult.doesNotDecide).toBe(true);
    });

    test("authority ownership absence PASS", () => {
        expect(
            validateAuthorityBoundaryContract(sampleAuthorityContract()).passed
        ).toBe(true);
        expect(
            validateResponsibilityExclusions(sampleResponsibility()).passed
        ).toBe(true);
        expect(ARCHITECTURE_EXTENSION_LAYER.hasAuthorityOwnership).toBe(false);
        const auth = sampleAuthorityContract();
        expect(auth.authorityAcquisitionCapability).toBe(false);
        expect(auth.authorityOverrideCapability).toBe(false);
        expect(auth.authorityDelegationCapability).toBe(false);
    });
});

describe("ASA-ARCH-45.0 — Frozen layer preservation", () => {
    test("Ch35/Ch42/Ch43/Ch44 preservation PASS", () => {
        const evidence: FrozenLayerDigestEvidence[] =
            FROZEN_LAYER_DIGEST_EXPECTATIONS.map((item) =>
                Object.freeze({
                    layer: item.layer,
                    artifactPath: item.artifactPath,
                    expectedSha256: item.expectedSha256,
                    actualSha256: sha256File(item.artifactPath),
                })
            );
        const result = validateAllFrozenLayersPresent(evidence);
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
        expect(ARCHITECTURE_EXTENSION_LAYER.preservesCh35).toBe(true);
        expect(ARCHITECTURE_EXTENSION_LAYER.preservesCh42).toBe(true);
        expect(ARCHITECTURE_EXTENSION_LAYER.preservesCh43).toBe(true);
        expect(ARCHITECTURE_EXTENSION_LAYER.preservesCh44).toBe(true);
    });
});

describe("ASA-ARCH-45.0 — ExtensionBoundaryValidator composition", () => {
    test("boundary and registry inspection PASS", () => {
        const validator = new ExtensionBoundaryValidator();
        expect(validator.inspectBoundary(sampleBoundary()).passed).toBe(true);
        expect(
            validator.inspectRegistryIntegrity(
                EXT_ID,
                frozenReader(sampleRegistryRecord()),
                emptyHistoryReader()
            ).passed
        ).toBe(true);
    });
});
