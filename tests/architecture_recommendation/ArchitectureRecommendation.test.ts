import * as fs from "fs";
import * as path from "path";
import {
    ARCHITECTURE_RECOMMENDATION_LAYER,
    RecommendationBoundaryValidator,
    RecommendationBuilder,
    RecommendationLifecycleStage,
    advanceOwnedLifecycleStage,
    freezeNonDecisionComplianceContract,
    freezeRecommendationAuthorityBoundaryContract,
    freezeRecommendationContract,
    freezeRecommendationDependencyBoundaryContract,
    freezeRecommendationLifecycleView,
    inspectFrozenLayerPreservation,
} from "../../src/architecture_recommendation";
import {
    sampleArchitectureState,
    sampleCandidate,
    sampleCandidateInput,
} from "./architectureRecommendationFixtures";

describe("ASA-ARCH-49.0 Architecture Recommendation Boundary Layer", () => {
    test("package isolation — no forbidden runtime/decision imports", () => {
        const root = path.join(
            process.cwd(),
            "src",
            "architecture_recommendation"
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
        const forbidden = [
            /from\s+["'][^"']*runtime_execution["']/,
            /from\s+["'][^"']*decision_layer["']/,
            /from\s+["'][^"']*decision_engine["']/,
            /from\s+["'][^"']*automatic_modification["']/,
        ];
        for (const file of files) {
            const text = fs.readFileSync(file, "utf8");
            for (const pattern of forbidden) {
                expect(pattern.test(text)).toBe(false);
            }
        }
        const allowed47 = files.some((f) =>
            fs
                .readFileSync(f, "utf8")
                .includes('from "../../architecture_intelligence"')
        );
        const allowed48 = files.some((f) =>
            fs
                .readFileSync(f, "utf8")
                .includes('from "../../architecture_traceability"')
        );
        expect(allowed47).toBe(true);
        expect(allowed48).toBe(true);
    });

    test("public export + contract integrity", () => {
        expect(ARCHITECTURE_RECOMMENDATION_LAYER.architectureId).toBe(
            "ASA-ARCH-49.0"
        );
        expect(ARCHITECTURE_RECOMMENDATION_LAYER.decisionAuthority).toBe(
            "NONE"
        );
        expect(
            ARCHITECTURE_RECOMMENDATION_LAYER.providesRecommendationOnly
        ).toBe(true);
        expect(
            ARCHITECTURE_RECOMMENDATION_LAYER.lifecycleTerminatesBeforeDecision
        ).toBe(true);
        expect(Object.isFrozen(ARCHITECTURE_RECOMMENDATION_LAYER)).toBe(true);

        expect(freezeRecommendationContract().forbidsDecisionResult).toBe(
            true
        );
        expect(
            freezeRecommendationAuthorityBoundaryContract().freezeAuthority
        ).toBe("NONE");
        expect(
            freezeRecommendationDependencyBoundaryContract()
                .dependsOnIntelligenceLayer
        ).toBe("ASA-ARCH-47.0");
        expect(
            freezeRecommendationDependencyBoundaryContract()
                .dependsOnTraceabilityLayer
        ).toBe("ASA-ARCH-48.0");
        expect(
            freezeNonDecisionComplianceContract()
                .lifecycleTerminatesBeforeDecisionAuthority
        ).toBe(true);
    });

    test("deterministic recommendation builder", () => {
        const state = sampleArchitectureState();
        const candidates = [
            sampleCandidateInput(sampleCandidate({ candidateId: "CAND-B" })),
            sampleCandidateInput(sampleCandidate({ candidateId: "CAND-A" })),
        ];
        const builder = new RecommendationBuilder();
        const first = builder.build({ architectureState: state, candidates });
        const second = builder.build({ architectureState: state, candidates });

        expect(first.recommendations).toHaveLength(2);
        expect(first.recommendations[0]!.candidate.candidateId).toBe("CAND-A");
        expect(first.recommendations[1]!.candidate.candidateId).toBe("CAND-B");
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
        expect(first.decisionResult).toBeNull();
        expect(first.approvalResult).toBeNull();
        expect(first.executionInstruction).toBeNull();
        expect(first.humanReviewRequired).toBe(true);
    });

    test("lifecycle terminates before decision authority", () => {
        const view = freezeRecommendationLifecycleView({
            currentStage: RecommendationLifecycleStage.RECOMMENDATION_OUTPUT,
        });
        expect(view.terminatesBeforeDecisionAuthority).toBe(true);
        expect(view.doesNotExecuteDecision).toBe(true);
        expect(view.ownedStages).not.toContain(
            RecommendationLifecycleStage.HUMAN_DECISION
        );
        expect(() =>
            freezeRecommendationLifecycleView({
                currentStage: RecommendationLifecycleStage.HUMAN_DECISION,
            })
        ).toThrow(/HUMAN_DECISION/);

        expect(
            advanceOwnedLifecycleStage(
                RecommendationLifecycleStage.HUMAN_REVIEW
            )
        ).toBe(RecommendationLifecycleStage.HUMAN_REVIEW);
    });

    test("boundary validator + frozen digests + evidence links", () => {
        const set = new RecommendationBuilder().build({
            architectureState: sampleArchitectureState(),
            candidates: [sampleCandidateInput()],
        });
        const validator = new RecommendationBoundaryValidator();
        const result = validator.inspectAll({
            recommendationSet: set,
            repoRoot: process.cwd(),
        });
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
        expect(inspectFrozenLayerPreservation(process.cwd()).passed).toBe(
            true
        );
    });
});
