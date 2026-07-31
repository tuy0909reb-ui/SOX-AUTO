/**
 * ASA-ARCH-43.0 - Drift Detector (Draft 0.7)
 *
 * IMPLEMENTATION drift = Metadata Alignment Drift Only.
 */

import type { DriftSeverity, DriftType } from "./ArchitectureValidationTypes";
import { hashArtifact } from "./HashIntegrity";

export interface ArchitectureSnapshotView {
    readonly snapshotId: string;
    readonly contracts: Readonly<Record<string, unknown>>;
    readonly boundaries: Readonly<Record<string, unknown>>;
    readonly implementationMetadata: Readonly<Record<string, unknown>>;
    readonly records: Readonly<Record<string, unknown>>;
    readonly evidence: Readonly<Record<string, unknown>>;
}

export interface DriftFinding {
    readonly type: DriftType;
    readonly severity: DriftSeverity;
    readonly path: string;
    readonly detail: string;
}

export interface DriftReport {
    readonly id: string;
    readonly historicalSnapshotId: string;
    readonly currentSnapshotId: string;
    readonly findings: ReadonlyArray<DriftFinding>;
    readonly driftFound: boolean;
    readonly implementationDriftIsMetadataOnly: true;
}

export interface DriftDetectorRole {
    readonly roleId: "DRIFT_DETECTOR";
    readonly implementationDriftIsMetadataAlignmentOnly: true;
    readonly forbidsLogicEvaluation: true;
}

export function freezeDriftDetectorRole(): DriftDetectorRole {
    return Object.freeze({
        roleId: "DRIFT_DETECTOR" as const,
        implementationDriftIsMetadataAlignmentOnly: true as const,
        forbidsLogicEvaluation: true as const,
    });
}

function compareMaps(
    type: DriftType,
    historical: Readonly<Record<string, unknown>>,
    current: Readonly<Record<string, unknown>>,
    severity: DriftSeverity
): DriftFinding[] {
    const findings: DriftFinding[] = [];
    const keys = new Set([...Object.keys(historical), ...Object.keys(current)]);
    for (const key of [...keys].sort()) {
        const h = historical[key];
        const c = current[key];
        if (h === undefined && c !== undefined) {
            findings.push({
                type,
                severity,
                path: key,
                detail: "added",
            });
        } else if (h !== undefined && c === undefined) {
            findings.push({
                type,
                severity,
                path: key,
                detail: "removed",
            });
        } else if (hashArtifact(h) !== hashArtifact(c)) {
            findings.push({
                type,
                severity,
                path: key,
                detail: "changed",
            });
        }
    }
    return findings;
}

export function detectArchitectureDrift(input: {
    readonly id: string;
    readonly historical: ArchitectureSnapshotView;
    readonly current: ArchitectureSnapshotView;
}): DriftReport {
    const findings = [
        ...compareMaps(
            "CONTRACT",
            input.historical.contracts,
            input.current.contracts,
            "HIGH"
        ),
        ...compareMaps(
            "BOUNDARY",
            input.historical.boundaries,
            input.current.boundaries,
            "HIGH"
        ),
        ...compareMaps(
            "IMPLEMENTATION",
            input.historical.implementationMetadata,
            input.current.implementationMetadata,
            "MEDIUM"
        ),
        ...compareMaps(
            "RECORD",
            input.historical.records,
            input.current.records,
            "MEDIUM"
        ),
        ...compareMaps(
            "EVIDENCE",
            input.historical.evidence,
            input.current.evidence,
            "CRITICAL"
        ),
    ];
    return Object.freeze({
        id: input.id,
        historicalSnapshotId: input.historical.snapshotId,
        currentSnapshotId: input.current.snapshotId,
        findings: Object.freeze(findings.map((f) => Object.freeze(f))),
        driftFound: findings.length > 0,
        implementationDriftIsMetadataOnly: true as const,
    });
}
