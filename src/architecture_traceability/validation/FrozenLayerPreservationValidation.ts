import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
    freezeInspectionResult,
    type TraceabilityInspectionResult,
} from "./inspectionResult";

export const FROZEN_LAYER_DIGEST_EXPECTATIONS = Object.freeze([
    {
        layer: "Ch46",
        artifactPath: "src/architecture_evolution_layer/index.ts",
        expectedSha256:
            "97bbdbd657f9928c99a868714167011b23a2b302c1cab185784370a12e17faee",
    },
    {
        layer: "Ch47",
        artifactPath: "src/architecture_intelligence/index.ts",
        expectedSha256:
            "249b8fa2b9536b25a4329b8f6e9bc876cacbc1ffaf4477f8f5fbba8afc15c09b",
    },
]);

export function inspectFrozenLayerPreservation(
    repoRoot: string = process.cwd()
): TraceabilityInspectionResult {
    const findings: string[] = [];
    for (const item of FROZEN_LAYER_DIGEST_EXPECTATIONS) {
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
            findings.push(`digest drift ${item.layer}`);
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
