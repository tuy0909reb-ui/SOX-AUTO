import * as fs from "fs";
import * as path from "path";
import {
    ARCHITECTURE_COMPLETION_LAYER,
    CompletionBoundaryValidator,
    CompletionEvaluator,
    CompletionStatus,
    freezeCompletionAuthorityBoundaryContract,
    freezeCompletionContract,
    freezeCompletionDependencyBoundaryContract,
    freezeNonEvolutionDecisionContract,
    inspectFrozenLayerPreservation,
} from "../../src/architecture_completion";
import {
    sampleCompleteArchitectureState,
    sampleIncompleteArchitectureState,
} from "./architectureCompletionFixtures";

describe("ASA-ARCH-50.0 Architecture Completion Layer", () => {
    test("package isolation — no forbidden runtime/decision imports", () => {
        const root = path.join(process.cwd(), "src", "architecture_completion");
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
    });

    test("public export + contract integrity", () => {
        expect(ARCHITECTURE_COMPLETION_LAYER.architectureId).toBe(
            "ASA-ARCH-50.0"
        );
        expect(ARCHITECTURE_COMPLETION_LAYER.decisionAuthority).toBe("NONE");
        expect(
            ARCHITECTURE_COMPLETION_LAYER.futureArchitectureAuthorization
        ).toBe("NONE");
        expect(
            ARCHITECTURE_COMPLETION_LAYER.providesCompletionEvidenceOnly
        ).toBe(true);
        expect(Object.isFrozen(ARCHITECTURE_COMPLETION_LAYER)).toBe(true);

        expect(freezeCompletionContract().forbidsEvolutionDecision).toBe(true);
        expect(
            freezeCompletionAuthorityBoundaryContract().freezeAuthority
        ).toBe("NONE");
        expect(
            freezeCompletionDependencyBoundaryContract()
                .dependsOnRecommendationLayer
        ).toBe("ASA-ARCH-49.0");
        expect(
            freezeNonEvolutionDecisionContract()
                .completionEvaluationIsNotFutureAuthorization
        ).toBe(true);
    });

    test("deterministic completion evaluation", () => {
        const state = sampleCompleteArchitectureState();
        const evaluator = new CompletionEvaluator();
        const first = evaluator.evaluate(state);
        const second = evaluator.evaluate(state);
        expect(first.completionStatus).toBe(CompletionStatus.COMPLETE);
        expect(first.architectureCoverage.coverageComplete).toBe(true);
        expect(first.evolutionDecision).toBeNull();
        expect(first.approvalResult).toBeNull();
        expect(first.executionInstruction).toBeNull();
        expect(first.futureArchitectureAuthorization).toBeNull();
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));

        const incomplete = evaluator.evaluate(
            sampleIncompleteArchitectureState()
        );
        expect(incomplete.completionStatus).toBe(CompletionStatus.INCOMPLETE);
        expect(incomplete.architectureCoverage.missingLayers.length).toBeGreaterThan(
            0
        );
    });

    test("boundary validator + frozen digests + evidence links", () => {
        const report = new CompletionEvaluator().evaluate(
            sampleCompleteArchitectureState()
        );
        const validator = new CompletionBoundaryValidator();
        const result = validator.inspectAll({
            completionReport: report,
            repoRoot: process.cwd(),
        });
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
        expect(inspectFrozenLayerPreservation(process.cwd()).passed).toBe(
            true
        );
    });
});
