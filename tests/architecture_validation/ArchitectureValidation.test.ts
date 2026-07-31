import {
    freezeBoundaryRules,
    validateBoundary,
} from "../../src/architecture_validation/BoundaryValidator";
import { validateContract } from "../../src/architecture_validation/ContractValidator";
import { detectArchitectureDrift } from "../../src/architecture_validation/DriftDetector";
import { validateFreezeIntegrity } from "../../src/architecture_validation/FreezeIntegrityValidator";
import {
    collectValidationEvidence,
    generateArchitectureHealthReport,
    recordValidationHistory,
    replayValidationReport,
    verifyValidationEvidenceRecord,
} from "../../src/architecture_validation/EvidenceHealthRecorder";
import { hashArtifact } from "../../src/architecture_validation/HashIntegrity";
import {
    executeValidationRules,
    loadValidationRuleSet,
} from "../../src/architecture_validation/ValidationRuleEngine";
import { freezeValidationRuleSet } from "../../src/architecture_validation/ValidationRules";
import {
    baseValidationBuilder,
    sampleDriftedSnapshot,
    sampleFrozenContract,
    sampleHistoricalSnapshot,
    sampleRegisteredModified,
    sampleRegisteredOk,
} from "./validationFixtures";

describe("ASA-ARCH-43.0 — Required Validation Tests", () => {
    test("CV-001 Modified Contract Detection → FAIL", () => {
        const result = validateContract({
            id: "cv-001",
            frozen: sampleFrozenContract(),
            registered: sampleRegisteredModified(),
            evidence_reference: "ev-cv-001",
        });
        expect(result.status).toBe("FAIL");
        expect(result.rule_reference).toBe("RULE-101");
        expect(result.evidence_reference).toBe("ev-cv-001");
        expect(result.violations.length).toBeGreaterThan(0);
    });

    test("BV-001 Boundary Violation Detection → FAIL", () => {
        const result = validateBoundary({
            id: "bv-001",
            target: "architecture-state",
            rules: freezeBoundaryRules(),
            state: {
                attemptsCoreWrite: true,
                attemptsFrozenWrite: false,
                attemptsAuthorityEscalation: false,
                attemptsOperationalControl: false,
            },
            evidence_reference: "ev-bv-001",
        });
        expect(result.status).toBe("FAIL");
        expect(result.rule_reference).toBe("RULE-102");
        expect(result.violations).toContain("Core write boundary violation");
    });

    test("FV-001 Frozen Artifact Change Detection → FAIL", () => {
        const result = validateFreezeIntegrity({
            id: "fv-001",
            freeze: {
                freezeId: "ASA-FREEZE-ARCH-42.0-001",
                artifactHash: "frozen-hash-original",
                freezeState: "FROZEN",
            },
            currentSnapshotHash: "frozen-hash-TAMPERED",
            evidence_reference: "ev-fv-001",
        });
        expect(result.status).toBe("FAIL");
        expect(result.rule_reference).toBe("RULE-103");
        expect(result.hash_before).not.toBe(result.hash_current);
    });

    test("DV-001 Architecture Drift Detection → DRIFT FOUND", () => {
        const report = detectArchitectureDrift({
            id: "dv-001",
            historical: sampleHistoricalSnapshot(),
            current: sampleDriftedSnapshot(),
        });
        expect(report.driftFound).toBe(true);
        expect(report.findings.some((f) => f.type === "CONTRACT")).toBe(true);
        expect(report.findings.some((f) => f.type === "IMPLEMENTATION")).toBe(
            true
        );
        expect(report.implementationDriftIsMetadataOnly).toBe(true);
    });

    test("EV-001 Missing Validation Evidence → FAIL", () => {
        const evaluation = executeValidationRules({
            contractIntegrityOk: true,
            boundaryIntegrityOk: true,
            freezeIntegrityOk: true,
            authorityProtected: true,
            reportIntegrityOk: false,
            evidenceHashOk: true,
            ruleSetHashMatchesApproved: true,
            approvedRuleEvolutionPresent: false,
        });
        expect(evaluation.status).toBe("FAIL");
        expect(
            evaluation.results.find((r) => r.ruleId === "RULE-105")?.status
        ).toBe("FAIL");
    });

    test("HI-001 Modified Frozen Snapshot → FAIL", () => {
        const frozen = sampleFrozenContract();
        const ok = validateContract({
            id: "hi-ok",
            frozen,
            registered: sampleRegisteredOk(),
            evidence_reference: "ev-ok",
        });
        expect(ok.status).toBe("PASS");

        const tamperedHash = hashArtifact({ mutated: true });
        const result = validateFreezeIntegrity({
            id: "hi-001",
            freeze: {
                freezeId: "ASA-FREEZE-TEST",
                artifactHash: frozen.hash,
                freezeState: "FROZEN",
            },
            currentSnapshotHash: tamperedHash,
            evidence_reference: "ev-hi-001",
        });
        expect(result.status).toBe("FAIL");
    });

    test("VI-001 Validation Modification Attempt → FAIL", () => {
        const layer = baseValidationBuilder().establish();
        expect(layer.authorityBoundary.forbidsChangeArchitectureState).toBe(
            true
        );
        expect(layer.authorityBoundary.forbidsRepairAutomatically).toBe(true);
        expect(
            layer.authorityBoundary.validationIsNotModificationAuthority
        ).toBe(true);

        const evaluation = executeValidationRules({
            contractIntegrityOk: true,
            boundaryIntegrityOk: true,
            freezeIntegrityOk: true,
            authorityProtected: false,
            reportIntegrityOk: true,
            evidenceHashOk: true,
            ruleSetHashMatchesApproved: true,
            approvedRuleEvolutionPresent: false,
        });
        expect(evaluation.status).toBe("FAIL");
        expect(
            evaluation.results.find((r) => r.ruleId === "RULE-104")?.status
        ).toBe("FAIL");
    });

    test("RV-001 Validation Report Replay → Original Validation State Recovery", () => {
        const evidence = collectValidationEvidence({
            id: "ev-rv-001",
            validation_id: "val-rv-001",
            snapshot_hash: "snap-h",
            contract_hash: "ctr-h",
            rule_set_hash: loadValidationRuleSet().hash,
            generated_at: "2026-07-30T00:00:00Z",
            validator_version: "1.0.0",
        });
        expect(verifyValidationEvidenceRecord(evidence)).toBe(true);

        const r1 = recordValidationHistory({
            record_id: "hist-1",
            validation_id: "val-rv-001",
            architecture_version: "ASA-ARCH-43.0",
            timestamp: "2026-07-30T00:01:00Z",
            status: "PASS",
            evidence_reference: evidence.id,
            report_snapshot: "report-pass",
        });
        const r2 = recordValidationHistory({
            record_id: "hist-2",
            validation_id: "val-rv-001",
            architecture_version: "ASA-ARCH-43.0",
            timestamp: "2026-07-30T00:02:00Z",
            status: "FAIL",
            evidence_reference: evidence.id,
            report_snapshot: "report-fail-final",
        });
        const replay = replayValidationReport([r1, r2]);
        expect(replay.recovered).toBe(true);
        if (replay.recovered) {
            expect(replay.status).toBe("FAIL");
            expect(replay.evidence_reference).toBe(evidence.id);
            expect(replay.validation_id).toBe("val-rv-001");
            expect(replay.architecture_version).toBe("ASA-ARCH-43.0");
        }
    });

    test("RI-001 Modified Validation Rule Detection → FAIL", () => {
        const approved = freezeValidationRuleSet();
        const evaluation = executeValidationRules({
            contractIntegrityOk: true,
            boundaryIntegrityOk: true,
            freezeIntegrityOk: true,
            authorityProtected: true,
            reportIntegrityOk: true,
            evidenceHashOk: true,
            ruleSetHashMatchesApproved: false,
            approvedRuleEvolutionPresent: false,
        });
        expect(evaluation.status).toBe("FAIL");
        expect(
            evaluation.results.find((r) => r.ruleId === "RULE-107")?.status
        ).toBe("FAIL");
        expect(approved.hash).toBe(loadValidationRuleSet().hash);
    });
});

describe("ASA-ARCH-43.0 — Layer / Health / Authority", () => {
    test("layer establish is deterministic and preserves Ch1–42", () => {
        const a = baseValidationBuilder().establish();
        const b = baseValidationBuilder().establish();
        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: layer.identity,
                metadata: layer.metadata,
                authorityBoundary: layer.authorityBoundary,
                readWriteBoundary: layer.readWriteBoundary,
                canonicalSourceModel: layer.canonicalSourceModel,
                implementationMetadataScope: layer.implementationMetadataScope,
                validationRules: layer.validationRules,
                hashPipeline: layer.hashPipeline,
            });
        expect(serialize(a)).toBe(serialize(b));
        expect(a.metadata.preservesChapters1Through42).toBe(true);
        expect(a.authorityBoundary.authority).toBe("VALIDATION_ANALYST");
        expect(a.authorityBoundary.finalAuthority).toBe("HUMAN_ARCHITECT");
        expect(a.validationRules.rules.map((r) => r.id)).toEqual([
            "RULE-101",
            "RULE-102",
            "RULE-103",
            "RULE-104",
            "RULE-105",
            "RULE-106",
            "RULE-107",
        ]);
    });

    test("health report recommendation is enum-managed", () => {
        const report = generateArchitectureHealthReport({
            id: "health-1",
            architecture_version: "ASA-ARCH-43.0",
            timestamp: "2026-07-30T00:00:00Z",
            contract_status: "FAIL",
            boundary_status: "PASS",
            freeze_status: "PASS",
            integrity_status: "PASS",
            drift_detected: true,
            evidence_hash: "eh",
        });
        expect(report.recommendation).toBe("INVESTIGATION_REQUIRED");
        expect(report.recommendationIsNotDecision).toBe(true);
        expect(report.validation_result).toBe("FAIL");
    });

    test("passing contract validation requires rule and evidence refs", () => {
        const result = validateContract({
            id: "cv-ok",
            frozen: sampleFrozenContract(),
            registered: sampleRegisteredOk(),
            evidence_reference: "ev-required",
        });
        expect(result.status).toBe("PASS");
        expect(result.rule_reference).toBe("RULE-101");
        expect(result.evidence_reference).toBe("ev-required");
    });
});
