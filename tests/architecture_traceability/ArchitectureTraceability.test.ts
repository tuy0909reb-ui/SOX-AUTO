import * as fs from "fs";
import * as path from "path";
import {
    ARCHITECTURE_TRACEABILITY_LAYER,
    TraceRegistry,
    TraceRelationshipType,
    TraceabilityBoundaryValidator,
    freezeTraceabilityAuthorityBoundaryContract,
    freezeTraceabilityContract,
    freezeTraceCompletenessContract,
    freezeTraceabilityDependencyBoundaryContract,
    inspectFrozenLayerPreservation,
} from "../../src/architecture_traceability";
import { sampleTraceRecord } from "./architectureTraceabilityFixtures";

describe("ASA-ARCH-48.0 Architecture Traceability Layer", () => {
    test("package isolation — no forbidden imports", () => {
        const root = path.join(
            process.cwd(),
            "src",
            "architecture_traceability"
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
            /from\s+["'][^"']*architecture_intelligence["']/,
            /from\s+["'][^"']*architecture_evolution_layer["']/,
            /from\s+["'][^"']*runtime_execution["']/,
            /from\s+["'][^"']*decision_layer["']/,
        ];
        for (const file of files) {
            const text = fs.readFileSync(file, "utf8");
            for (const pattern of forbidden) {
                expect(pattern.test(text)).toBe(false);
            }
        }
    });

    test("public export integrity", () => {
        expect(ARCHITECTURE_TRACEABILITY_LAYER.architectureId).toBe(
            "ASA-ARCH-48.0"
        );
        expect(ARCHITECTURE_TRACEABILITY_LAYER.packageIdentity).toBe(
            "architecture_traceability"
        );
        expect(ARCHITECTURE_TRACEABILITY_LAYER.traceabilityAuthority).toBe(
            "NONE"
        );
        expect(ARCHITECTURE_TRACEABILITY_LAYER.isAppendOriented).toBe(true);
        expect(
            ARCHITECTURE_TRACEABILITY_LAYER.providesTraceVisibilityOnly
        ).toBe(true);
        expect(Object.isFrozen(ARCHITECTURE_TRACEABILITY_LAYER)).toBe(true);
    });

    test("contract integrity", () => {
        expect(freezeTraceabilityContract().forbidsSilentReplacement).toBe(
            true
        );
        expect(
            freezeTraceabilityAuthorityBoundaryContract()
                .providesTraceVisibilityOnly
        ).toBe(true);
        expect(
            freezeTraceabilityDependencyBoundaryContract()
                .dependsOnIntelligenceLayer
        ).toBe("ASA-ARCH-47.0");
        expect(freezeTraceCompletenessContract().requiredStages).toHaveLength(
            10
        );
    });

    test("append-oriented registry forbids silent replacement", () => {
        const registry = new TraceRegistry();
        const record = sampleTraceRecord();
        registry.append(record);
        expect(registry.get(record.traceId)?.relationshipType).toBe(
            TraceRelationshipType.CREATED_FROM
        );
        expect(() => registry.append(record)).toThrow(/silent replacement/);
        const second = sampleTraceRecord({
            traceId: "TR-48-002",
            relationshipType: TraceRelationshipType.IMPLEMENTS,
        });
        registry.append(second);
        expect(registry.listBySource(record.sourceArtifact)).toHaveLength(2);
    });

    test("boundary validator + frozen digests", () => {
        const registry = new TraceRegistry();
        registry.append(sampleTraceRecord());
        const validator = new TraceabilityBoundaryValidator();
        const result = validator.inspectAll({
            registry,
            sourceArtifact: "ASA-ARCH-48.0",
            repoRoot: process.cwd(),
        });
        expect(result.passed).toBe(true);
        expect(result.findings).toEqual([]);
        expect(inspectFrozenLayerPreservation(process.cwd()).passed).toBe(true);
    });
});
