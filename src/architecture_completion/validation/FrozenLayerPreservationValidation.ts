import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
    freezeInspectionResult,
    type CompletionInspectionResult,
} from "./inspectionResult";

export const FROZEN_LAYER_DIGEST_EXPECTATIONS = Object.freeze([
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
        layer: "Ch47",
        artifactPath: "src/architecture_intelligence/index.ts",
        expectedSha256:
            "249b8fa2b9536b25a4329b8f6e9bc876cacbc1ffaf4477f8f5fbba8afc15c09b",
    },
    {
        layer: "Ch48",
        artifactPath: "src/architecture_traceability/index.ts",
        expectedSha256:
            "057018b94b839a0c36ebfe04d472e8f8c6d885cf6e5d1a8dabfb74cd0f8ae6c2",
    },
    {
        layer: "Ch49",
        artifactPath: "src/architecture_recommendation/index.ts",
        expectedSha256:
            "b998147baa7e1bb454aaea0187fe012968f2c35fd419600a9171c0f5b2b4bc36",
    },
]);

export function inspectFrozenLayerPreservation(
    repoRoot: string = process.cwd()
): CompletionInspectionResult {
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
