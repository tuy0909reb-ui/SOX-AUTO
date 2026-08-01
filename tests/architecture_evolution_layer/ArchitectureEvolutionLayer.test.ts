import * as fs from "fs";
import * as path from "path";
import {
    ARCHITECTURE_EVOLUTION_LAYER,
    EvolutionBoundaryValidator,
    EvolutionLifecycleState,
    EvolutionRegistry,
    createApprovalReference,
    createArchitectureIdentifier,
    createEvolutionIdentifier,
    createIntegrityReference,
    freezeEvolutionAuthorityBoundaryContract,
    freezeEvolutionBoundaryContract,
    freezeEvolutionDependencyBoundaryContract,
    freezeEvolutionLifecycleDeclarationContract,
    freezeEvolutionRegistryRecord,
    freezeEvolutionResponsibilityDeclaration,
    freezeFoundationCompatibilityContract,
    inspectFrozenLayerPreservation,
} from "../../src/architecture_evolution_layer";
import {
    sampleCompatibilityDeclaration,
    sampleEvolutionBoundary,
    sampleEvolutionIdentity,
    sampleRegistryRecord,
} from "./architectureEvolutionLayerFixtures";

describe("ASA-ARCH-46.0 Architecture Evolution Layer", () => {
    test("package isolation — no forbidden imports", () => {
        const root = path.join(
            process.cwd(),
            "src",
            "architecture_evolution_layer"
        );
        const files: string[] = [];
        const walk = (dir: string) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (entry.name.endsWith(".ts")) files.push(full);
            }
        };
        walk(root);
        const forbiddenImport = [
            /from\s+["'][^"']*architecture_evolution["']/,
            /from\s+["'][^"']*architecture_operations["']/,
            /from\s+["'][^"']*architecture_validation["']/,
            /from\s+["'][^"']*extension_governance["']/,
            /from\s+["'][^"']*runtime_execution["']/,
            /from\s+["'][^"']*decision_layer["']/,
            /from\s+["'][^"']*extensions\/asa_/,
        ];
        for (const file of files) {
            const text = fs.readFileSync(file, "utf8");
            // Allow digest path strings to frozen layers; forbid package imports.
            if (file.includes(`${path.sep}architecture_evolution_layer${path.sep}`)) {
                for (const pattern of forbiddenImport) {
                    expect(pattern.test(text)).toBe(false);
                }
            }
        }
    });

    test("public export integrity — layer marker", () => {
        expect(ARCHITECTURE_EVOLUTION_LAYER.architectureId).toBe("ASA-ARCH-46.0");
        expect(ARCHITECTURE_EVOLUTION_LAYER.packageIdentity).toBe(
            "architecture_evolution_layer"
        );
        expect(ARCHITECTURE_EVOLUTION_LAYER.evolutionAuthority).toBe("NONE");
        expect(ARCHITECTURE_EVOLUTION_LAYER.runtimeAuthority).toBe("NONE");
        expect(ARCHITECTURE_EVOLUTION_LAYER.decisionAuthority).toBe("NONE");
        expect(ARCHITECTURE_EVOLUTION_LAYER.finalAuthority).toBe(
            "HUMAN_ARCHITECT"
        );
        expect(ARCHITECTURE_EVOLUTION_LAYER.hasRuntimeIntegration).toBe(false);
        expect(ARCHITECTURE_EVOLUTION_LAYER.hasDecisionCapability).toBe(false);
        expect(ARCHITECTURE_EVOLUTION_LAYER.hasAuthorityOwnership).toBe(false);
        expect(ARCHITECTURE_EVOLUTION_LAYER.dependsOnExtensionBoundary).toBe(
            "ASA-ARCH-45.0"
        );
        expect(ARCHITECTURE_EVOLUTION_LAYER.dependsOnFoundation).toBe(
            "ASA-FOUNDATION-1.0"
        );
        expect(Object.isFrozen(ARCHITECTURE_EVOLUTION_LAYER)).toBe(true);
    });

    test("contract integrity", () => {
        const boundary = freezeEvolutionBoundaryContract();
        const authority = freezeEvolutionAuthorityBoundaryContract();
        const dependency = freezeEvolutionDependencyBoundaryContract();
        const foundation = freezeFoundationCompatibilityContract();
        const lifecycle = freezeEvolutionLifecycleDeclarationContract();
        const responsibility = freezeEvolutionResponsibilityDeclaration();

        expect(boundary.evolutionWithoutMutation).toBe(true);
        expect(boundary.forbidsFoundationModification).toBe(true);
        expect(authority.authorityAcquisitionCapability).toBe(false);
        expect(authority.evolutionAuthority).toBe("NONE");
        expect(dependency.allowedDependencyDirection).toBe(
            "Future→Ch46→Ch45→Foundation"
        );
        expect(foundation.foundationId).toBe("ASA-FOUNDATION-1.0");
        expect(lifecycle.requiresVerificationBeforeRegistration).toBe(true);
        expect(responsibility.doesNotOwn).toContain("Runtime execution");
        expect(Object.isFrozen(boundary)).toBe(true);
        expect(Object.isFrozen(authority)).toBe(true);
    });

    test("immutable models", () => {
        const identity = sampleEvolutionIdentity();
        const boundary = sampleEvolutionBoundary();
        const compatibility = sampleCompatibilityDeclaration();
        const record = sampleRegistryRecord();
        expect(identity.immutable).toBe(true);
        expect(boundary.immutable).toBe(true);
        expect(compatibility.immutable).toBe(true);
        expect(record.immutable).toBe(true);
        expect(Object.isFrozen(identity)).toBe(true);
        expect(Object.isFrozen(record)).toBe(true);
        expect(record.declarationState).toBe(EvolutionLifecycleState.APPROVED);
    });

    test("registry isolation", () => {
        const registry = new EvolutionRegistry();
        const record = sampleRegistryRecord();
        registry.storeRecord(record);
        expect(registry.hasRecord(record.evolutionId)).toBe(true);
        expect(registry.getRecord(record.evolutionId)?.integrityReference).toBe(
            record.integrityReference
        );
        const reader = registry.asReader();
        const writer = registry.asWriter();
        expect(reader.doesNotOwnAuthority).toBe(true);
        expect(writer.doesNotActivate).toBe(true);
        expect(() => registry.storeRecord(record)).toThrow(/already registered/);
        const replaced = sampleRegistryRecord("integrity-46-002");
        registry.replaceRecord(record.evolutionId, replaced);
        expect(
            registry.getRecord(record.evolutionId)?.integrityReference
        ).toBe("integrity-46-002");
        const missingId = createEvolutionIdentifier("EVOL-MISSING");
        const missingRecord = freezeEvolutionRegistryRecord({
            evolutionId: missingId,
            architectureId: createArchitectureIdentifier("ASA-ARCH-46.0"),
            declarationState: EvolutionLifecycleState.APPROVED,
            approvalReference: createApprovalReference(
                "ASA-AUTH-IMPLEMENT-ARCH-46.0-001"
            ),
            integrityReference: createIntegrityReference("integrity-missing"),
        });
        expect(() =>
            registry.replaceRecord(missingId, missingRecord)
        ).toThrow(/not registered/);
    });

    test("dependency direction + boundary validator", () => {
        const validator = new EvolutionBoundaryValidator();
        const result = validator.inspectAll({
            record: sampleRegistryRecord(),
            layerSurface: { ...ARCHITECTURE_EVOLUTION_LAYER },
            repoRoot: process.cwd(),
        });
        expect(result.isInspectionOnly).toBe(true);
        expect(result.doesNotDecide).toBe(true);
        expect(result.doesNotGrantAuthority).toBe(true);
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
    });

    test("frozen layer digest preservation", () => {
        const result = inspectFrozenLayerPreservation(process.cwd());
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
    });

    test("lifecycle has no runtime activation states", () => {
        const values = Object.values(EvolutionLifecycleState);
        for (const forbidden of [
            "ACTIVE",
            "ENABLE",
            "ACTIVATE",
            "EXECUTE",
            "RUN",
        ]) {
            expect(values).not.toContain(forbidden);
        }
    });
});
