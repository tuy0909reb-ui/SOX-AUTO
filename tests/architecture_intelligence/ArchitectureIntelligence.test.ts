import * as fs from "fs";
import * as path from "path";
import {
    ARCHITECTURE_INTELLIGENCE_LAYER,
    ArchitectureImpactAnalyzer,
    ArchitectureKnowledgeModel,
    ArchitectureEvolutionReportBuilder,
    EvidenceChain,
    EVIDENCE_CHAIN_STAGES,
    IntelligenceBoundaryValidator,
    freezeIntelligenceAuthorityBoundaryContract,
    freezeIntelligenceDependencyBoundaryContract,
    freezeKnowledgeContract,
    freezeImpactContract,
    freezeReportContract,
    freezeEvidenceContract,
    inspectFrozenLayerPreservation,
} from "../../src/architecture_intelligence";
import {
    sampleCandidate,
    sampleEvidence,
    sampleEvolutionRequest,
    sampleKnowledgeRecord,
} from "./architectureIntelligenceFixtures";

describe("ASA-ARCH-47.0 Architecture Intelligence Layer", () => {
    test("package isolation — no forbidden imports", () => {
        const root = path.join(process.cwd(), "src", "architecture_intelligence");
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
            /from\s+["'][^"']*architecture_evolution_layer["']/,
            /from\s+["'][^"']*architecture_extension["']/,
            /from\s+["'][^"']*runtime_execution["']/,
            /from\s+["'][^"']*decision_layer["']/,
        ];
        for (const file of files) {
            const text = fs.readFileSync(file, "utf8");
            for (const pattern of forbiddenImport) {
                expect(pattern.test(text)).toBe(false);
            }
        }
    });

    test("public export integrity — layer marker", () => {
        expect(ARCHITECTURE_INTELLIGENCE_LAYER.architectureId).toBe(
            "ASA-ARCH-47.0"
        );
        expect(ARCHITECTURE_INTELLIGENCE_LAYER.packageIdentity).toBe(
            "architecture_intelligence"
        );
        expect(ARCHITECTURE_INTELLIGENCE_LAYER.intelligenceAuthority).toBe(
            "NONE"
        );
        expect(ARCHITECTURE_INTELLIGENCE_LAYER.decisionAuthority).toBe("NONE");
        expect(ARCHITECTURE_INTELLIGENCE_LAYER.providesEvidenceOnly).toBe(true);
        expect(ARCHITECTURE_INTELLIGENCE_LAYER.hasAutomaticApproval).toBe(
            false
        );
        expect(ARCHITECTURE_INTELLIGENCE_LAYER.hasAutomaticFreeze).toBe(false);
        expect(Object.isFrozen(ARCHITECTURE_INTELLIGENCE_LAYER)).toBe(true);
    });

    test("contract integrity", () => {
        expect(freezeKnowledgeContract().requiresRationale).toBe(true);
        expect(freezeImpactContract().forbidsApproval).toBe(true);
        expect(freezeReportContract().doesNotCreateDecisions).toBe(true);
        expect(freezeEvidenceContract().requiresTrace).toBe(true);
        expect(
            freezeIntelligenceAuthorityBoundaryContract().providesEvidenceOnly
        ).toBe(true);
        expect(
            freezeIntelligenceDependencyBoundaryContract()
                .allowedDependencyDirection
        ).toBe("Frozen→Knowledge→Analysis→Evidence");
    });

    test("knowledge model stores immutable records", () => {
        const model = new ArchitectureKnowledgeModel();
        const record = sampleKnowledgeRecord();
        model.store(record);
        expect(model.get(record.architectureId)?.designDecision).toBe(
            record.designDecision
        );
        expect(() => model.store(record)).toThrow(/already stored/);
    });

    test("impact analyzer produces evidence only", () => {
        const analyzer = new ArchitectureImpactAnalyzer();
        const request = sampleEvolutionRequest();
        const evidence = analyzer.analyze(request);
        expect(evidence.isAnalyticalEvidenceOnly).toBe(true);
        expect(evidence.doesNotApprove).toBe(true);
        expect(evidence.doesNotReject).toBe(true);
        expect(evidence.affectedComponents).toEqual(request.proposedScope);
        expect(Object.isFrozen(evidence)).toBe(true);
    });

    test("report builder produces human review package", () => {
        const analyzer = new ArchitectureImpactAnalyzer();
        const builder = new ArchitectureEvolutionReportBuilder();
        const request = sampleEvolutionRequest();
        const impact = analyzer.analyze(request);
        const report = builder.build({
            currentArchitectureState: "ASA-ARCH-46.0 FROZEN",
            evolutionRequest: request,
            impactAnalysisResult: impact,
            candidates: [sampleCandidate()],
        });
        expect(report.isHumanReviewPackage).toBe(true);
        expect(report.doesNotCreateDecisions).toBe(true);
        expect(report.candidates).toHaveLength(1);
    });

    test("evidence chain stages and append", () => {
        const chain = new EvidenceChain();
        expect(chain.stages()).toEqual(EVIDENCE_CHAIN_STAGES);
        const record = sampleEvidence();
        chain.append(record);
        expect(chain.get(record.evidenceId)?.result).toBe(record.result);
        expect(() => chain.append(record)).toThrow(/already recorded/);
    });

    test("boundary validator + frozen digests", () => {
        const validator = new IntelligenceBoundaryValidator();
        const result = validator.inspectAll({ repoRoot: process.cwd() });
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
        expect(inspectFrozenLayerPreservation(process.cwd()).passed).toBe(
            true
        );
    });
});
