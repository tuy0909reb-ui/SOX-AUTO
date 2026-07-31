/**
 * ASA-ARCH-45.0 — RegistryValidation
 * Read-only registry isolation / integrity inspection via registry interfaces.
 */

import type {
    ExtensionRegistryHistoryReader,
    ExtensionRegistryReader,
    ExtensionValidationInspectionResult,
} from "../interfaces";
import type { ExtensionIdentifier } from "../types";
import { freezeInspectionResult } from "./inspectionResult";

export function validateRegistryIsolation(
    reader: ExtensionRegistryReader
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!reader.readOnly) {
        findings.push("Registry reader must be readOnly");
    }
    if (!reader.doesNotOwnAuthority) {
        findings.push("Registry reader must not own authority");
    }
    if (!reader.doesNotActivateExtension) {
        findings.push("Registry reader must keep doesNotActivateExtension=true");
    }
    if (!reader.doesNotApproveExtension) {
        findings.push("Registry reader must not approve extensions");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateRegistryRecordIntegrity(
    extensionId: ExtensionIdentifier,
    reader: ExtensionRegistryReader,
    historyReader: ExtensionRegistryHistoryReader
): ExtensionValidationInspectionResult {
    const findings: string[] = [];

    if (!historyReader.readOnly) {
        findings.push("History reader must be readOnly");
    }
    if (!historyReader.doesNotActivateExtension) {
        findings.push("History reader must keep doesNotActivateExtension=true");
    }

    const record = reader.getRecord(extensionId);
    if (!record) {
        findings.push("Registry record not found");
        return freezeInspectionResult({ passed: false, findings });
    }
    if (!record.immutable) {
        findings.push("Registry record must be immutable");
    }
    if (!record.doesNotActivateExtension || !record.doesNotExecuteExtension) {
        findings.push(
            "Registry record must keep doesNotActivateExtension/doesNotExecuteExtension=true"
        );
    }
    if (!record.doesNotApproveExtension) {
        findings.push("Registry record must forbid approval capability");
    }
    if (!record.integrityReference) {
        findings.push("Registry integrityReference is required");
    }
    if (record.extensionId !== extensionId) {
        findings.push("Registry record extensionId mismatch");
    }

    const history = historyReader.getHistory(extensionId);
    for (const entry of history) {
        if (!entry.immutable) {
            findings.push("History record must be immutable");
        }
        if (entry.extensionId !== extensionId) {
            findings.push("History record extensionId mismatch");
        }
    }

    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateDeterministicLookup(
    reader: ExtensionRegistryReader
): ExtensionValidationInspectionResult {
    const first = reader.listRecords();
    const second = reader.listRecords();
    const findings: string[] = [];
    if (first.length !== second.length) {
        findings.push("listRecords length is non-deterministic");
    } else {
        for (let i = 0; i < first.length; i += 1) {
            if (first[i]?.extensionId !== second[i]?.extensionId) {
                findings.push("listRecords order is non-deterministic");
                break;
            }
            if (
                first[i]?.integrityReference !== second[i]?.integrityReference
            ) {
                findings.push("listRecords content is non-deterministic");
                break;
            }
        }
        for (let i = 1; i < first.length; i += 1) {
            const prev = String(first[i - 1]?.extensionId ?? "");
            const curr = String(first[i]?.extensionId ?? "");
            if (prev.localeCompare(curr) > 0) {
                findings.push("listRecords is not sorted by extensionId");
                break;
            }
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
