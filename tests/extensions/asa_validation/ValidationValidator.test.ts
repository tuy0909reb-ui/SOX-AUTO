import {
    baseValidationValidator,
    sampleValidationExtensionContract,
} from "./validationFixtures";

describe("ASA-ARCH-39.0 — ValidationValidator", () => {
    test("establishes immutable layer with VALIDATOR authority", () => {
        const layer = baseValidationValidator().establish();
        expect(Object.isFrozen(layer)).toBe(true);
        expect(layer.identity.extensionId).toBe("ASA-VALIDATION");
        expect(layer.extensionContract.authority).toBe("VALIDATOR");
        expect(layer.securityBoundary.holdsValidatorResponsibility).toBe(true);
        expect(layer.securityBoundary.holdsExecutionAuthority).toBe(false);
    });

    test("rejects non-VALIDATOR authority", () => {
        const bad = {
            ...sampleValidationExtensionContract(),
            authority: "ADVISOR" as unknown as "VALIDATOR",
        };
        expect(() =>
            baseValidationValidator().withExtensionContract(bad).establish()
        ).toThrow(/Authority Declaration must be VALIDATOR/);
    });

    test("rejects missing validation contract", () => {
        expect(() =>
            baseValidationValidator()
                .withValidationContract(undefined as never)
                .establish()
        ).toThrow(/ValidationContract is required/);
    });

    test("rejects evidence fabrication allowance", () => {
        expect(() =>
            baseValidationValidator()
                .withEvidenceContract({
                    evidenceContractId: "bad",
                    requiredFields: [
                        "source",
                        "reference",
                        "timestamp",
                        "integrityHash",
                        "verificationMethod",
                    ],
                    evidenceMustRemainTraceable: true,
                    forbidsFabricationByValidator: false as true,
                    evidenceOriginMustBePreserved: true,
                    mayTransformRepresentationOnly: true,
                    forbidsAlterEvidenceOrigin: true,
                })
                .establish()
        ).toThrow(/Evidence Integrity/);
    });

    test("rejects discovery engine posture", () => {
        expect(() =>
            baseValidationValidator()
                .withValidatorDiscovery({
                    discoveryContractId: "bad",
                    operationLabel: "discoverValidators",
                    criteriaDeclaredStructurally: true,
                    consumesExtensionRegistryByReference: true,
                    registryIsNotExecutionAuthority: true,
                    forbidsFrameworkMutation: true,
                    isNotRuntimeDiscoveryEngine: false as true,
                })
                .establish()
        ).toThrow(/Validator Discovery Contract invalid/);
    });
});
