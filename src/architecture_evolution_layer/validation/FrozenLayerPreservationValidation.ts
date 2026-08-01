/**
 * ASA-ARCH-46.0 — FrozenLayerPreservationValidation
 * Selected digest expectations for Foundation-range frozen layers.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import type { EvolutionValidationInspectionResult } from "../interfaces";
import { freezeInspectionResult } from "./inspectionResult";

export interface FrozenDigestExpectation {
    readonly layer: string;
    readonly artifactPath: string;
    readonly expectedSha256: string;
}

export const FROZEN_LAYER_DIGEST_EXPECTATIONS: readonly FrozenDigestExpectation[] =
    Object.freeze([
        {
            layer: "Ch35",
            artifactPath:
                "src/extension_governance/ExtensionGovernanceTypes.ts",
            expectedSha256:
                "2ef85a745ee7b68e660c2f358f93bac1a6c9e9dd52566c1fd466ec6b24c0fdb1",
        },
        {
            layer: "Ch42",
            artifactPath:
                "src/architecture_evolution/ArchitectureEvolutionBuilder.ts",
            expectedSha256:
                "6a6e964421aa08896eb3969b166b7a2ad99d1b33cd5801940aca71e83fc3106e",
        },
        {
            layer: "Ch43",
            artifactPath:
                "src/architecture_validation/ArchitectureValidationBuilder.ts",
            expectedSha256:
                "944eefb253e29b7286b564a23383dff1132eff18231e2f75150c3b3b41803928",
        },
        {
            layer: "Ch44",
            artifactPath: "src/architecture_operations/index.ts",
            expectedSha256:
                "ed17c353b92bd4aa5903969c0326e3c1cb8a8b552b5019be09a079ef6f008b76",
        },
        {
            layer: "Ch45",
            artifactPath: "src/architecture_extension/index.ts",
            expectedSha256:
                "80f1223ed2f5f74eeb33232fe169855305f7d362e58c582aefd9b02e1013013f",
        },
    ]);

export function inspectFrozenLayerPreservation(
    repoRoot: string = process.cwd(),
    expectations: readonly FrozenDigestExpectation[] = FROZEN_LAYER_DIGEST_EXPECTATIONS
): EvolutionValidationInspectionResult {
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
            findings.push(
                `digest drift ${item.layer} ${item.artifactPath}`
            );
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
