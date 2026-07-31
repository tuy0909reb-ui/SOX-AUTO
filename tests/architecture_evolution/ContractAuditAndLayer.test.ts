import {
    validateEvolutionProposalSchema,
} from "../../src/architecture_evolution/EvolutionProposal";
import {
    validateImpactReportSchema,
} from "../../src/architecture_evolution/ImpactReport";
import {
    createArchitectureEvolutionRecord,
    replayEvolutionDecisionState,
    verifyArchitectureEvolutionRecord,
} from "../../src/architecture_evolution/ArchitectureEvolutionRecord";
import { createEvolutionProposal } from "../../src/architecture_evolution/EvolutionPlanner";
import { recordArchitectureEvolution } from "../../src/architecture_evolution/GovernanceRecorder";
import {
    createContractSnapshot,
    verifyContractSnapshot,
} from "../../src/architecture_evolution/ContractSnapshot";
import { hashArtifact } from "../../src/architecture_evolution/HashIntegrity";
import { freezeValidationRuleSet } from "../../src/architecture_evolution/ValidationRules";
import { baseEvolutionBuilder } from "./evolutionFixtures";

describe("ASA-ARCH-42.0 — Contract Schema Tests", () => {
    test("CT-001 Invalid EvolutionProposal → Schema Validation FAIL", () => {
        const invalid = { id: "p1", version: "1.0.0" };
        const result = validateEvolutionProposalSchema(invalid);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.reason).toMatch(/Missing required field/);
        }
    });

    test("CT-002 Invalid ImpactReport → Schema Validation FAIL", () => {
        const invalid = { changed_component: "x" };
        const result = validateImpactReportSchema(invalid);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.reason).toMatch(/Missing required field/);
        }
    });
});

describe("ASA-ARCH-42.0 — Audit Replay", () => {
    test("AUD-001 Evolution History Replay → Original Decision State Recovery", () => {
        const proposal = createEvolutionProposal({
            intent: {
                intentId: "intent-1",
                description: "compatible extension metadata",
                target_area: "EXTENSION",
                motivation: "document evolution path",
                proposed_state: "documented",
                risk_level: "LOW",
            },
            currentState: {
                architecture_version: "ASA-ARCH-42.0",
                current_state: "frozen-41",
                known_contracts: ["ext.contract.A"],
            },
            architectureVersion: "ASA-ARCH-42.0",
            created_at: "2026-07-30T00:00:00Z",
            created_by: "human-architect",
            proposalId: "prop-aud-001",
            proposalVersion: "1.0.0",
        });

        const analysis = recordArchitectureEvolution({
            record_id: "rec-analysis-001",
            proposal,
            record_type: "ANALYSIS",
            timestamp: "2026-07-30T00:01:00Z",
            schema_version: "1.0.0",
            source_snapshot: "snap-current-001",
            analysis_result: "COMPATIBLE",
            approval_result: "PENDING_HUMAN",
            freeze_result: "NOT_AUTHORIZED",
        });

        const approval = recordArchitectureEvolution({
            record_id: "rec-approval-001",
            proposal,
            record_type: "APPROVAL",
            timestamp: "2026-07-30T00:02:00Z",
            schema_version: "1.0.0",
            source_snapshot: "snap-decision-001",
            analysis_result: "COMPATIBLE",
            approval_result: "APPROVED_BY_HUMAN_ARCHITECT",
            freeze_result: "NOT_AUTHORIZED",
        });

        expect(verifyArchitectureEvolutionRecord(analysis)).toBe(true);
        expect(verifyArchitectureEvolutionRecord(approval)).toBe(true);
        expect(analysis.recordGenerationIsNotApprovalAuthority).toBe(true);

        const replay = replayEvolutionDecisionState([analysis, approval]);
        expect(replay.recovered).toBe(true);
        if (replay.recovered) {
            expect(replay.approval_result).toBe(
                "APPROVED_BY_HUMAN_ARCHITECT"
            );
            expect(replay.freeze_result).toBe("NOT_AUTHORIZED");
            expect(replay.proposal_id).toBe("prop-aud-001");
            expect(replay.architecture_version).toBe("ASA-ARCH-42.0");
        }
    });
});

describe("ASA-ARCH-42.0 — Snapshot / Hash / Layer", () => {
    test("snapshot immutable versioned referenceable with hash verify", () => {
        const snap = createContractSnapshot({
            snapshotId: "s1",
            kind: "DECISION",
            version: "1.0.0",
            architecture_version: "ASA-ARCH-42.0",
            timestamp: "2026-07-30T00:00:00Z",
            payload: { decision: "PENDING_HUMAN" },
        });
        expect(snap.immutable).toBe(true);
        expect(snap.versioned).toBe(true);
        expect(snap.referenceable).toBe(true);
        expect(verifyContractSnapshot(snap)).toBe(true);
    });

    test("validation rule set and record hashes are stable", () => {
        const a = freezeValidationRuleSet();
        const b = freezeValidationRuleSet();
        expect(a.hash).toBe(b.hash);
        expect(a.hash).toBe(hashArtifact(a.rules));

        const record = createArchitectureEvolutionRecord({
            schema_version: "1.0.0",
            record_id: "r1",
            proposal_id: "p1",
            architecture_version: "ASA-ARCH-42.0",
            timestamp: "2026-07-30T00:00:00Z",
            record_type: "PROPOSAL",
            source_snapshot: "s1",
            analysis_result: "n/a",
            approval_result: "PENDING_HUMAN",
            freeze_result: "NOT_AUTHORIZED",
        });
        expect(verifyArchitectureEvolutionRecord(record)).toBe(true);
    });

    test("layer establish is deterministic and preserves Ch1–41", () => {
        const a = baseEvolutionBuilder().establish();
        const b = baseEvolutionBuilder().establish();
        const serialize = (layer: typeof a) =>
            JSON.stringify({
                identity: layer.identity,
                metadata: layer.metadata,
                authorityBoundary: layer.authorityBoundary,
                readWriteBoundary: layer.readWriteBoundary,
                analysisScope: layer.analysisScope,
                proposalSchema: layer.proposalSchema,
                impactSchema: layer.impactSchema,
                validationRules: layer.validationRules,
                hashPipeline: layer.hashPipeline,
                versionSet: layer.versionSet,
                versioningPolicy: layer.versioningPolicy,
                plannerRole: layer.plannerRole,
                analyzerRole: layer.analyzerRole,
                impactRole: layer.impactRole,
                compatibilityRole: layer.compatibilityRole,
                compatibilityRules: layer.compatibilityRules,
                recorderRole: layer.recorderRole,
            });
        expect(serialize(a)).toBe(serialize(b));
        expect(a.metadata.preservesChapters1Through41).toBe(true);
        expect(a.identity.coreVersion).toBe("ASA-CORE-34.0");
        expect(a.authorityBoundary.authority).toBe("EVOLUTION_ANALYST");
        expect(a.versionSet.architectureChapterVersionIsNotContractVersion).toBe(
            true
        );
    });

    test("valid proposal schema accepts complete proposal", () => {
        const proposal = createEvolutionProposal({
            intent: {
                intentId: "i",
                description: "d",
                target_area: "SCENARIO",
                motivation: "m",
                proposed_state: "p",
            },
            currentState: {
                architecture_version: "ASA-ARCH-42.0",
                current_state: "c",
                known_contracts: [],
            },
            architectureVersion: "ASA-ARCH-42.0",
            created_at: "2026-07-30T00:00:00Z",
            created_by: "architect",
            proposalId: "p-ok",
            proposalVersion: "1.0.0",
        });
        expect(validateEvolutionProposalSchema(proposal).ok).toBe(true);
        expect(proposal.proposalIsNotApproval).toBe(true);
    });
});
