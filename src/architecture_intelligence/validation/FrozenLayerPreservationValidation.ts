/**
 * ASA-ARCH-47.0 — selected digest preservation for Foundation-range layers
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
    freezeInspectionResult,
    type IntelligenceInspectionResult,
} from "./inspectionResult";

export interface FrozenDigestExpectation {
    readonly layer: string;
    readonly artifactPath: string;
    readonly expectedSha256: string;
}

export const FROZEN_LAYER_DIGEST_EXPECTATIONS: readonly FrozenDigestExpectation[] =
    Object.freeze([
        {
            layer: "Ch45",
            artifactPath: "src/architecture_extension/index.ts",
            expectedSha256:
                "80f1223ed2f5f74eeb33232fe169855305f7d362e58c582aefd9b02e1013013f",
        },
        {
            layer: "Ch46",
            artifactPath: "src/architecture_evolution_layer/index.ts",
            expectedSha256:
                "97bbdbd657f9928c99a868714167011b23a2b302c1cab185784370a12e17faee",
        },
        {
            layer: "Ch42",
            artifactPath:
                "src/architecture_evolution/ArchitectureEvolutionBuilder.ts",
            expectedSha256:
                "6a6e964421aa08896eb3969b166b7a2ad99d1b33cd5801940aca71e83fc3106e",
        },
    ]);

export function inspectFrozenLayerPreservation(
    repoRoot: string = process.cwd(),
    expectations: readonly FrozenDigestExpectation[] = FROZEN_LAYER_DIGEST_EXPECTATIONS
): IntelligenceInspectionResult {
    const findings: string[] = [];
    for (const item of expectations) {
        const full = path.join(repoRoot, item.artifactPath);
        if (!fs.existsSync(full)) {
            findings.push(`missing frozen artifact: ${item.artifactPath}`);
            continue;
        }
        const got = crypto
            .createHash("sha256")
            .update(fs.readFileSync(full))
            .digest("hex");
        if (got !== item.expectedSha256) {
            findings.push(`digest drift ${item.layer} ${item.artifactPath}`);
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
